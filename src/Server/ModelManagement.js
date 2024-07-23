import axios from 'axios'
import * as tf from '@tensorflow/tfjs'

const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

const createMemoryIOHandler = (modelJson, weightsArrayBuffer) => {
    return {
      load: async () => {
        return {
          modelTopology: modelJson.modelTopology,
          weightSpecs: modelJson.weightsManifest[0].weights,
          weightData: new Uint8Array(weightsArrayBuffer),
        };
      },
    };
  }

class Model{
    constructor(name){
        this.name = name
        this.sampleCountHistory = []
        this.lossHistory = []
        this.accuracyHistory = []
        this.scoreHistory = []
    }
    async loadModel(){
        try{
            let trainingHistory = undefined
            if(isNode){
                const response = new Promise((resolve, reject) => {
                    axios.post('http://localhost:3001/loadTrainingHistory', {
                        data: {
                            name: this.name,
                        }
                    })
                    .then(response => {
                        const result = response.data.response
                        resolve(result)

                    })
                    .catch(error => console.error('Error:', error))
                })
                const result = await response
                trainingHistory = JSON.parse(result.trainingHistory)
            }
            else{
                trainingHistory = await fetch(`${process.env.PUBLIC_URL}/${this.name}/trainingHistory`)
                trainingHistory = await trainingHistory.json()

            }
            this.sampleCountHistory = trainingHistory.sampleCountHistory
            this.lossHistory = trainingHistory.lossHistory
            this.accuracyHistory = trainingHistory.accuracyHistory
            this.scoreHistory = trainingHistory.scoreHistory
        } catch(error){
            console.error(error)
        }
    }
    async saveModel(){
        return new Promise((resolve, reject) => {
            axios.post('http://localhost:3001/saveTrainingHistory', {
                data: {
                    name: this.name,
                    trainingHistory: JSON.stringify({
                        sampleCountHistory: this.sampleCountHistory,
                        lossHistory: this.lossHistory,
                        accuracyHistory: this.accuracyHistory,
                        scoreHistory: this.scoreHistory
                    })

                }
            })
            .then(response => {
                resolve(response)
            })
            .catch(error => console.error('Error:', error))
        })
    }
}

export class DeepQNetwork extends Model{
    constructor(name, inputShape, outputShape){
        super(name)
        this.inputShape = inputShape
        this.outputShape = outputShape
        this.model = undefined
    }

    init(){
        const inputLayer = tf.input({shape: [this.inputShape]})
        const dense1 = tf.layers.dense({units: 64, activation: 'relu', })//kernelRegularizer: tf.regularizers.l2({l2: 0.1})})
        const dense2 = tf.layers.dense({units: 64, activation: 'relu', })//kernelRegularizer: tf.regularizers.l2({l2: 0.1})})
        const dense3 = tf.layers.dense({units: 32, activation: 'relu', })//kernelRegularizer: tf.regularizers.l2({l2: 0.1})})
        const outputLayer = tf.layers.dense({units: this.outputShape, activation: 'linear', name: 'output'})

        let x = dense1.apply(inputLayer)
        x = dense2.apply(x)
        x = dense3.apply(x)
        const output = outputLayer.apply(x)

        let model = tf.model({inputs: inputLayer, outputs:output})
        model.compile({optimizer: tf.train.adam(0.001), loss: {'output': 'meanSquaredError'}, metrics: ['accuracy']})
        this.model = model
        // return model
    }
    async loadModel(){
        await super.loadModel()
        try{
            let loadedModel = undefined
            let modelData = undefined
            let weightsData = undefined
            if(isNode){
                const response = new Promise((resolve, reject) => {
                    axios.post('http://localhost:3001/loadDeepQNetwork', {
                        data: {
                            name: this.name,
                        }
                    })
                    .then(response => {
                        const result = response.data.response
                        resolve(result)

                    })
                    .catch(error => console.error('Error:', error))
                })
                const result = await response
                modelData = JSON.parse(result.modelData)
                weightsData = result.weightsData
                const ioHandler = createMemoryIOHandler(modelData, weightsData.data)
                loadedModel = await tf.loadLayersModel(ioHandler)
            }
            else{
                loadedModel = await tf.loadLayersModel(`${process.env.PUBLIC_URL}/${this.name}/model.json`)

            }
            loadedModel.compile({optimizer: tf.train.adam(0.001), loss: {'output': 'meanSquaredError'}, metrics: ['accuracy']})
            this.model = loadedModel
        } catch(error){
            console.error(error)
        }
    }
    async saveModel(){
        await super.saveModel()
        if(!this.model){
            return new Promise((resolve) => resolve(false))
        }
        const modelData = await this.model?.save(tf.io.withSaveHandler(async (data) => data));
        // Convert the weights data to a base64-encoded string
        const weightsData = Buffer.from(modelData?.weightData).toString('base64');
        // console.debug(this.lossHistory)
        return new Promise((resolve, reject) => {
            axios.post('http://localhost:3001/saveDeepQNetwork', {
                data: {
                    name: this.name,
                    modelData: JSON.stringify(modelData),
                    weightsData: weightsData
                }
            })
            .then(response => {
                resolve(response)
            })
            .catch(error => console.error('Error:', error))
        })
    }

    // ob<array> -> tensor
    async trainModel(input){
        //existing q values to fill in output tensor aside from newly trained actions
        const onlineOutput = await this.predictModel(input.states)
        // console.debug(onlineOutput)
        //Current highest q value for each (next) state
        const maxOnlineQValues = tf.max(onlineOutput, 1).arraySync()
        // console.log(maxOnlineQValues)
        for(let i=0; i<input.states.length-1; i++){
            // console.debug("----------------------------------------")
            // console.debug(input.states[i], input.actions[i], input.rewards[i], input.done[i], onlineOutput[i])
            // if(input.done[i]){
            //     console.debug(input.actions[i], input.rewards[i], onlineOutput[i])
            // }
            if(input.done[i] !== true){
                onlineOutput[i][input.actions[i]] = input.rewards[i] + maxOnlineQValues[i+1]
            }
            else if(input.done[i] === true){
                onlineOutput[i][input.actions[i]] = input.rewards[i]
            }
        }
        const tfInput = tf.tensor(input.states)
        const targetOutput = {'output': tf.tensor(onlineOutput)}
        let history = await this.model.fit(tfInput, targetOutput, {epochs: 1, shuffle: true})
        const loss = history.history.loss
        const accuracy = history.history.acc
        // this.trainingHistory = this.trainingHistory ? this.trainingHistory.concat(loss) : loss
        // console.log("loss: ", loss[loss.length-1], "accuracy: ", accuracy[accuracy.length-1])
        return new Promise((resolve, reject) => {
            resolve(history)
        })
    }
    //array -> tensor -> array
    async predictModel(input){
        let output = this.model?.predict(tf.tensor(input)).arraySync()
        return new Promise((resolve, reject) => {
            resolve(output)
        })
    }
}

export class GeneticArray extends Model{
    constructor(name, outputShape, sequenceLength, populationSize){
        super(name)
        this.outputShape = outputShape
        this.sequenceLength = sequenceLength
        this.populationSize = populationSize

        this.model = undefined
    }

    init(){
        const model = [] 
        for(let i=0; i<this.populationSize; i++){
            model.push(new Sequence(this.outputShape, this.sequenceLength))
        }
        this.model = model
    }
    async loadModel(){
        super.loadModel()
        try{
            let arrayData = undefined
            if(isNode){
                const response = new Promise((resolve, reject) => {
                    axios.post('http://localhost:3001/loadGeneticArray', {
                        data: {
                            name: this.name,
                        }
                    })
                    .then(response => {
                        const result = response.data.response
                        resolve(result)

                    })
                    .catch(error => console.error('Error:', error))
                })
                const result = await response
                arrayData = JSON.parse(result.arrayData)
            }
            else{
                arrayData = await fetch(`${process.env.PUBLIC_URL}/${this.name}/arrayData`)
                arrayData = await arrayData.json()

            }
            const newModel = []
            for(let i=0; i<arrayData.length; i++){
                const newSequence = new Sequence(arrayData[i].outputShape, arrayData[i].sequenceLength)
                newSequence.fitness = arrayData[i].fitness
                newSequence.sequence = arrayData[i].sequence
                newModel.push(newSequence)
            }
            this.model = newModel
        } catch(error){
            console.error(error)
        }
    }
    async saveModel(){
        super.saveModel()
        return new Promise((resolve, reject) => {
            axios.post('http://localhost:3001/saveGeneticArray', {
                data: {
                    name: this.name,
                    arrayData: JSON.stringify(this.model)
                }
            })
            .then(response => {
                resolve(response)
            })
            .catch(error => console.error('Error:', error))
        })
    }

    // // ob<array> -> tensor
    // async trainModel(input){


    // }

}
class Sequence {
    constructor(outputShape, sequenceLength){
        this.outputShape = outputShape
        this.sequenceLength = sequenceLength
        this.fitness = 0
        this.sequence = this.newRandom()
    }
    clone(){
        const newSequence = new Sequence(this.outputShape, this.sequenceLength)
        newSequence.fitness = this.fitness
        newSequence.sequence = JSON.parse(JSON.stringify(this.sequence))
        return newSequence
    }
    mutate(){
        for(let i=0; i<this.sequence.length; i++){
            if(Math.floor(Math.random()*3) < 1){
                this.sequence[i] = Math.floor(Math.random()*this.outputShape)
            }
        }
    }
    newRandom(){
        const newSequence = Array(this.sequenceLength).fill(0)
        for(let i=0; i<newSequence.length; i++){
            newSequence[i] = Math.floor(Math.random()*this.outputShape)
        }
        return newSequence
    }
  
  }
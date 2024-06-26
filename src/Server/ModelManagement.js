import axios from 'axios'
import * as tf from '@tensorflow/tfjs'


const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
// const tfPath = isNode ? '@tensorflow/tfjs' : '@tensorflow/tfjs-node'
// const tf = await import(tfPath)



// if(isNode){
//     const fs = await import('fs')
// }
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

export class tfModel{
    constructor(inputShape, outputShape, name){
        this.inputShape = inputShape
        this.outputShape = outputShape
        this.name = name
        this.model = null
        this.sampleCountHistory = []
        this.lossHistory = []
        this.accuracyHistory = []
        this.scoreHistory = []
    }

    initModel(){
        // ****************** X model ******************
        //Input Layer
        const inputLayer = tf.input({shape: [this.inputShape]})
        //Hidden Layers

        const dense1 = tf.layers.dense({units: 64, activation: 'relu', })//kernelRegularizer: tf.regularizers.l2({l2: 0.1})})
        const dense2 = tf.layers.dense({units: 64, activation: 'relu', })//kernelRegularizer: tf.regularizers.l2({l2: 0.1})})
        const dense3 = tf.layers.dense({units: 32, activation: 'relu', })//kernelRegularizer: tf.regularizers.l2({l2: 0.1})})
        //Output Layer
        const outputLayer = tf.layers.dense({units: this.outputShape, activation: 'linear', name: 'output'})

        //Apply Layers
        let x = dense1.apply(inputLayer)
        x = dense2.apply(x)
        x = dense3.apply(x)
        const output = outputLayer.apply(x)

        //Create and compile model
        let model = tf.model({inputs: inputLayer, outputs:output})
        // console.log(model.summary())
        model.compile({optimizer: tf.train.adam(0.001), loss: {'output': 'meanSquaredError'}, metrics: ['accuracy']})
        this.model = model
        // return model
    }
    async loadModel(){
        try{
            let loadedModel = undefined
            let trainingHistory = undefined
            let modelData = undefined
            let weightsData = undefined
            if(isNode){
                const response = new Promise((resolve, reject) => {
                    axios.post('http://localhost:3001/loadModel', {
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

                // console.debug("result:", result)
                modelData = JSON.parse(result.modelData)

                weightsData = result.weightsData
                // console.debug("weightsData: ", typeof(weightsData))
                trainingHistory = JSON.parse(result.trainingHistory)
                // console.debug(result.trainingHistory)
                const ioHandler = createMemoryIOHandler(modelData, weightsData.data)
                loadedModel = await tf.loadLayersModel(ioHandler)
            }
            else{
                loadedModel = await tf.loadLayersModel(`/${this.name}/model.json`)
                trainingHistory = await fetch(`/${this.name}/trainingHistory`)
                trainingHistory = await trainingHistory.json()

            }
            this.sampleCountHistory = trainingHistory.sampleCountHistory
            this.lossHistory = trainingHistory.lossHistory
            this.accuracyHistory = trainingHistory.accuracyHistory
            this.scoreHistory = trainingHistory.scoreHistory
            loadedModel.compile({optimizer: tf.train.adam(0.001), loss: {'output': 'meanSquaredError'}, metrics: ['accuracy']})
            this.model = loadedModel
        } catch(error){
            console.error(error)
        }
    }
    async saveModel(){
        // Get model topology (JSON) and weights (binary)
        if(!this.model){
            return new Promise((resolve) => resolve(false))
        }
        const modelData = await this.model?.save(tf.io.withSaveHandler(async (data) => data));
        // console.debug(modelData)
        // Convert the weights data to a base64-encoded string
        const weightsData = Buffer.from(modelData?.weightData).toString('base64');
        // console.debug(this.lossHistory)
        return new Promise((resolve, reject) => {
            axios.post('http://localhost:3001/saveModel', {
                data: {
                    name: this.name,
                    modelData: JSON.stringify(modelData),//.modelTopology,
                    weightsData: weightsData,
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
            if(input.done[i] !== true){
                onlineOutput[i][input.actions[i]] = input.rewards[i] + maxOnlineQValues[i+1]
            }
            else if(input.done[i] === true){
                for(let j=0; j<onlineOutput[i].length; j++){
                    onlineOutput[i][j] = input.rewards[i]
                }
            }
            // console.debug(input.states[i], input.actions[i], input.rewards[i], input.done[i], onlineOutput[i])
            // if(i > 0 && input.rewards[i] > 1){
            //     console.debug(input.states[i], input.actions[i], input.rewards[i], input.done[i], onlineOutput[i])
            // }
            // if(i > 0 && input.done[i]){
            //     console.debug(input.states[i-1], input.actions[i-1], input.rewards[i-1], input.done[i-1], onlineOutput[i-1])
            // }
        }

        const tfInput = tf.tensor(input.states)
        const targetOutput = {'output': tf.tensor(onlineOutput)}

        let history = await this.model.fit(tfInput, targetOutput, {epochs: 1, shuffle: true})
        const loss = history.history.loss
        const accuracy = history.history.acc
        // this.trainingHistory = this.trainingHistory ? this.trainingHistory.concat(loss) : loss
        console.log("loss: ", loss[loss.length-1], "accuracy: ", accuracy[accuracy.length-1])
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
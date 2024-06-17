const tf = require('@tensorflow/tfjs')

export class tfModel{
    constructor(inputShape, outputShape, name){
        this.inputShape = inputShape
        this.outputShape = outputShape
        this.name = name
        this.model = null
        this.trainingHistory = []
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

        return model
    }
    async loadModel(){
        try{
            let loadedModel = await tf.loadLayersModel(`localstorage://${this.name}`)
            this.trainingHistory = JSON.parse(localStorage.getItem(`${this.name}/trainingHistory`))
            this.scoreHistory = JSON.parse(localStorage.getItem(`${this.name}/scoreHistory`))
            // let loadedModel = await tf.loadGraphModel(`/${this.name}`)//for loading statically once deployed

            loadedModel.compile({optimizer: tf.train.adam(0.001), loss: {'output': 'meanSquaredError'}, metrics: ['accuracy']})
            this.model = loadedModel
        } catch(error){
            console.error(error)
        }
    }
    async saveModel(){
        try{
            this.model.save(`localstorage://${this.name}`)
            localStorage.setItem(`${this.name}/trainingHistory`, JSON.stringify(this.trainingHistory))
            localStorage.setItem(`${this.name}/scoreHistory`, JSON.stringify(this.scoreHistory))
            return new Promise((resolve, reject) => {
                resolve(true)
            })
        } catch(error){
            console.error(error)
        }
    }
    async backupModel(){
        try{
            this.model.save(`localstorage://${this.name}-backup`)
            localStorage.setItem(`${this.name}/trainingHistory-backup`, JSON.stringify(this.trainingHistory))
            localStorage.setItem(`${this.name}/scoreHistory-backup`, JSON.stringify(this.scoreHistory))
            return new Promise((resolve, reject) => {
                resolve(true)
            })
        } catch(error){
            console.error(error)
        }
    }
    resetModel(){
        localStorage.removeItem(`${this.name}`)
        localStorage.removeItem(`${this.name}/trainingHistory`)
        localStorage.removeItem(`${this.name}/scoreHistory`)
        this.model = this.initModel(this.inputShape, this.outputShape)
        this.trainingHistory = []
        this.scoreHistory = []
      }
    // ob<array> -> tensor
    async trainModel(input){
        //existing q values to fill in output tensor aside from newly trained actions
        const onlineOutput = await this.predictModel(input.states)
        //Current highest q value for each (next) state
        const maxOnlineQValues = tf.max(onlineOutput, 1).arraySync()
        console.log(maxOnlineQValues)
        for(let i=0; i<input.states.length-1; i++){
            // console.log(input.states[i], input.actions[i], input.rewards[i], input.done[i], onlineOutput[i])
            if(input.done[i] !== true){
                onlineOutput[i][input.actions[i]] = input.rewards[i] + maxOnlineQValues[i+1]
            }
            else if(input.done[i] === true){
                for(let j=0; j<onlineOutput[i].length; j++){
                    onlineOutput[i][j] = input.rewards[i]
                }
            }
        }

        const tfInput = tf.tensor(input.states)
        const targetOutput = {'output': tf.tensor(onlineOutput)}

        let history = await this.model.fit(tfInput, targetOutput, {epochs: 1, shuffle: true})
        const loss = history.history.loss
        const accuracy = history.history.acc
        this.trainingHistory = this.trainingHistory ? this.trainingHistory.concat(loss) : loss
        console.log("loss: ", loss[loss.length-1], "accuracy: ", accuracy[accuracy.length-1])
        return new Promise((resolve, reject) => {
            resolve(history)
        })
    }
    //array -> tensor -> array
    async predictModel(input){
        let output = this.model.predict(tf.tensor(input)).arraySync()
        return new Promise((resolve, reject) => {
            resolve(output)
        })
    }
}
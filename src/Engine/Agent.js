import { tfModel } from '../Server/ModelManagement.js'
import * as tf from '@tensorflow/tfjs'
// const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
// const tfPath = isNode ? '@tensorflow/tfjs' : '@tensorflow/tfjs-node'
// const tf = await import(tfPath)


export class Agent {
  constructor(params){
    this.BATCH_SIZE = 1024
    this.states = []
    this.actions = []
    this.rewards = []
    this.done = []
    this.onlineModel = this.loadModel(params)

  }
  loadModel(params){
    const inputSize = params[0]
    const outputSize = params[1]
    const name = params[2]
    let onlineModel = new tfModel(inputSize, outputSize, name)
    onlineModel.initModel()
    onlineModel.loadModel()

    return onlineModel
  }


  async getPrediction(state){
    // console.debug(state)
    if(state === undefined || state === null || !this.onlineModel){
      return 0
    }
    // console.debug(this?.onlineModel)
    let prediction = await this.onlineModel?.predictModel([state])

    prediction = tf.argMax(tf.tensor(prediction[0]), 0).arraySync()
    // console.debug("----------------------------")
    // console.debug(state)
    // console.debug(prediction)
    // console.debug(states[states.length-1], actions[actions.length-1], rewards[rewards.length-1], done[done.length-1])
    return prediction

  }
  pushDataPoint(state, prediction, reward, done){
    if(state === undefined || reward === undefined || done === undefined ||
      state === null || reward === null || done === null){
      return 0
    }
    this.states.push(state)
    this.actions.push(prediction)
    this.rewards.push(reward)
    this.done.push(done)
  }
  async trainModel(){
        //Shallow copy onlineModel attribute for agent re-render in Engine
        const onlineModel = new tfModel(this.onlineModel.inputShape, this.onlineModel.outputShape, this.onlineModel.name)
        onlineModel.model = this.onlineModel.model
        onlineModel.sampleCountHistory = this.onlineModel.sampleCountHistory
        onlineModel.lossHistory = this.onlineModel.lossHistory
        onlineModel.accuracyHistory = this.onlineModel.accuracyHistory
        onlineModel.scoreHistory = this.onlineModel.scoreHistory
        const input = {
          'states': this.states,
          'actions': this.actions,
          'rewards': this.rewards,
          'done': this.done
        }
        console.debug(input)
        this.states = []
        this.actions = []
        this.rewards = []
        this.done = []

        const history = await onlineModel?.trainModel(input)

        this.onlineModel = onlineModel
        return new Promise((resolve, reject) => {
          resolve(history)
      })
  }

}


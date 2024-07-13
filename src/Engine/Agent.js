import { DeepQNetwork, GeneticArray } from '../Server/ModelManagement.js'
import * as tf from '@tensorflow/tfjs'
// const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
// const tfPath = isNode ? '@tensorflow/tfjs' : '@tensorflow/tfjs-node'
// const tf = await import(tfPath)


class Agent {
  constructor(){

  }


  async getPrediction(state){

  }
  pushDataPoint(state, prediction, reward, done){

  }
  async trainModel(){

  }
  async engineCycle(game){
    const state = game?.getState()
    const action = await this?.getPrediction(state)
    game?.move(action)
    game?.getResult()
  }
}



export class DeepQAgent extends Agent {
  constructor(params){
    super()
    this.BATCH_SIZE = 1024
    this.states = []
    this.actions = []
    this.rewards = []
    this.done = []
    this.onlineModel = this.loadModel(params)
  }
  
  loadModel(params){
    const name = params[0]
    const inputShape = params[1]
    const outputShape = params[2]
    let onlineModel = new DeepQNetwork(name, inputShape, outputShape)
    onlineModel.init()
    onlineModel.loadModel()
    return onlineModel
  }

  async getPrediction(state){
    super.getPrediction()
    if(state === undefined || state === null || !this.onlineModel){
      return 0
    }
    let prediction = await this.onlineModel?.predictModel([state])
    prediction = tf.argMax(tf.tensor(prediction[0]), 0).arraySync()
    return prediction
  }

  pushDataPoint(state, prediction, reward, done){
    super.pushDataPoint()
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
    super.trainModel()
    //Shallow copy onlineModel attribute for agent re-render in Engine
    const onlineModel = new DeepQNetwork(this.onlineModel.name, this.onlineModel.inputShape, this.onlineModel.outputShape)
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
    // console.debug(input)
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
  async engineCycle(game){
    super.engineCycle(game)
  }

}


export class GeneticAgent extends Agent{
  constructor(params, sequenceLength, populationSize){
    super()
      this.BATCH_SIZE = populationSize * sequenceLength
      this.sequenceLength = sequenceLength
      this.populationSize = populationSize

      this.step = 0
      this.onlineModel = this.loadModel(params)
      
  }
  loadModel(params){
      const name = params[0]
      const outputShape = params[2]
      let model = new GeneticArray(name, outputShape, this.sequenceLength, this.populationSize)
      model.init()
      model.loadModel()
      return model
  }

  async getPrediction(state){
      super.getPrediction()
      const sequence = parseInt(this.step / this.sequenceLength)
      const index = parseInt(this.step % this.sequenceLength)
      const action = this.onlineModel?.model[sequence]?.sequence[index]
      this.step = (this.step + 1)// % (this.sequenceLength * this.populationSize)
      return action
  }
  // trainModel()
  // pushDataPoint(state, action, reward, done){
  //   super.pushDataPoint()
  //     const sequence = parseInt(this.step / this.sequenceLength)
  //     this.onlineModel?.model[sequence]?.fitness += reward
  //     if(this.step >= this.BATCH_SIZE){
  //         this.sortPopulation()
  //         this.mutatePopulation()
  //         this.step = 0
  //     }
  //     // console.debug(this.population[sequence].fitness)
  // }
  // sortPopulation(){
  //     this.onlineModel?.model.sort((a, b) => b.fitness - a.fitness)
  //     for(let i=parseInt(this.onlineModel?.model.length/10); i<this.onlineModel?.model.length; i++){
  //         this.onlineModel?.model[i] = this.onlineModel?.model[Math.floor(Math.random()*parseInt(this.onlineModel?.model.length/10))].clone()
  //     }
  //     for(let i=0; i<this.onlineModel?.model.length; i++){
  //         this.onlineModel?.model[i].fitness = 0
  //     }

  // }
  // mutatePopulation(){
  //     for(let i=0; i<this.onlineModel?.model.length; i++){
  //         this.onlineModel?.model[i].mutate()
  //     }
  // }
  async engineCycle(game){
    if((this?.step % this?.sequenceLength) === 0){
        game?.initGame()
    }
    super.engineCycle(game)
  }
}

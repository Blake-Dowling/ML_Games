import { DeepQNetwork, GeneticArray } from '../Server/ModelManagement.js'
import * as tf from '@tensorflow/tfjs'
// const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
// const tfPath = isNode ? '@tensorflow/tfjs' : '@tensorflow/tfjs-node'
// const tf = await import(tfPath)


class Agent {
  constructor(){
    this.highScore = 0
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
  async trainCycle(game){
    const state = game?.getState()
    const action = await this.getPrediction(state)
    let result = undefined
    while(!result){
        game?.move(action)
        result = game?.getResult()
    }
    this.pushDataPoint(state, action, result?.reward, result?.done)
  }
  async trainBatch(game){
    this.highScore = 0
    for(let i=0; i<this.BATCH_SIZE; i++){
      await this.trainCycle(game)
      this.highScore = Math.max(game?.score, this.highScore)
    }
  }
  async trainSession(game){
    let prevNumSamples = this.onlineModel?.sampleCountHistory[this.onlineModel?.sampleCountHistory?.length-1]
    prevNumSamples = prevNumSamples ? prevNumSamples : 0
    let newNumSamples = prevNumSamples
    const BATCHES_PER_SESSION = 1000
    let avgScore = 0
    console.log("----------------------------------------------------------")
    while(newNumSamples-prevNumSamples<this.BATCH_SIZE*BATCHES_PER_SESSION){
      await this.trainBatch(game)
      avgScore += this.highScore
      newNumSamples += this.BATCH_SIZE
      console.log(newNumSamples, " samples.")
    }
    this.onlineModel?.sampleCountHistory?.push(newNumSamples)
    this.onlineModel?.scoreHistory?.push(avgScore/(BATCHES_PER_SESSION))
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
    this.history = undefined
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
    await super.getPrediction(state)
    if(state === undefined || state === null || !this.onlineModel){
      return 0
    }
    let prediction = await this.onlineModel?.predictModel([state])
    prediction = tf.argMax(tf.tensor(prediction[0]), 0).arraySync()
    return prediction
  }

  pushDataPoint(state, prediction, reward, done){
    super.pushDataPoint(state, prediction, reward, done)
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
    await super.trainModel()
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
    this.history = await onlineModel?.trainModel(input)
    this.onlineModel = onlineModel
  }
  async engineCycle(game){
    await super.engineCycle(game)
  }
  async trainCycle(game){
    await super.trainCycle(game)
    if(this.states.length >= this.BATCH_SIZE+1){
        await this.trainModel()
    }
  }
  async trainBatch(game){
    await super.trainBatch(game)
  }
  async trainSession(game){
    await super.trainSession(game)
    const loss = parseFloat(this.history.history.loss[0].toFixed(3))
    const accuracy = parseFloat(this.history.history.acc[0].toFixed(3))
    this.onlineModel?.lossHistory?.push(loss)
    this.onlineModel?.accuracyHistory?.push(accuracy)
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
      await super.getPrediction()
      const sequence = parseInt(this.step / this.sequenceLength)
      const index = parseInt(this.step % this.sequenceLength)
      const action = this.onlineModel?.model[sequence]?.sequence[index]
      this.step = (this.step + 1)// % (this.sequenceLength * this.populationSize)
      return action
  }
  // trainModel()
  pushDataPoint(state, action, reward, done){
      super.pushDataPoint()
      const sequence = parseInt((this.step - 1) / this.sequenceLength)
      this.onlineModel.model[sequence].fitness += reward
      if(this.step >= this.BATCH_SIZE){
        this.sortPopulation()
        this.mutatePopulation()
        this.step = 0
    }
      // console.debug(this.population[sequence].fitness)
  }
  sortPopulation(){
      this.onlineModel?.model.sort((a, b) => b.fitness - a.fitness)
      for(let i=parseInt(this.onlineModel?.model.length/10); i<this.onlineModel?.model.length; i++){
          this.onlineModel.model[i] = this.onlineModel?.model[Math.floor(Math.random()*parseInt(this.onlineModel?.model.length/10))].clone()
      }
      console.debug(this.onlineModel.model[0].fitness)
      for(let i=0; i<this.onlineModel?.model.length; i++){
          this.onlineModel.model[i].fitness = 0
      }

  }
  mutatePopulation(){
      for(let i=0; i<this.onlineModel?.model.length; i++){
          this.onlineModel?.model[i].mutate()
      }
  }
  async engineCycle(game){
    if((this?.step % this?.sequenceLength) === 0){
        game?.initGame()
    }
    await super.engineCycle(game)
  }
  async trainCycle(game){
    await super.trainCycle(game)
  }
  async trainBatch(game){
    await super.trainBatch(game)
  }
  async trainSession(game){
    await super.trainSession(game)
  }
}

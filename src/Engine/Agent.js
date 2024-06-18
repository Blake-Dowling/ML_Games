import React, {useState, useEffect} from 'react'

import { tfModel } from '../Server/ModelManagement'
const tf = require('@tensorflow/tfjs')


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


  async getPrediction(state, reward, done){
    console.debug("-----------------------")
    console.debug(state, reward, done)
    if(state === undefined || reward === undefined || done === undefined ||
      state === null || reward === null || done === null){
      return 0
    }
    let prediction = await this.onlineModel?.predictModel([state])
    console.debug(prediction)
    prediction = tf.argMax(tf.tensor(prediction[0]), 0).arraySync()

    this.states.push(state)
    this.actions.push(prediction)
    this.rewards.push(reward)
    this.done.push(done)

    return prediction
    // console.debug(states[states.length-1], actions[actions.length-1], rewards[rewards.length-1], done[done.length-1])
  }
  async trainModel(highScore){
        //Shallow copy onlineModel attribute for agent re-render in Engine
        const onlineModel = new tfModel(this.onlineModel.inputShape, this.onlineModel.outputShape, this.onlineModel.name)
        onlineModel.model = this.onlineModel.model
        onlineModel.trainingHistory = this.onlineModel.trainingHistory
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
        if(onlineModel?.scoreHistory){
          onlineModel?.scoreHistory?.push(highScore)
        }
        else{
          onlineModel.scoreHistory = [highScore]
        }
        const history = await onlineModel?.trainModel(input)

        onlineModel?.saveModel()
        if(onlineModel.scoreHistory.length !== 0 && (onlineModel.scoreHistory.length*this.BATCH_SIZE) % 50000 < this.BATCH_SIZE){
          onlineModel.backupModel()
        }
        this.onlineModel = onlineModel

  }

}


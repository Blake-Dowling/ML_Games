import React, {useState, useEffect} from 'react'

import { tfModel } from '../Server/ModelManagement'
const tf = require('@tensorflow/tfjs')

const BATCH_SIZE = 32

let states = []
let actions = []
let rewards = []
let done = []

export function Agent(props) {
  function loadModel(params){
    const inputSize = params[0]
    const outputSize = params[1]
    const name = params[2]
    let onlineModel = new tfModel(inputSize, outputSize, name)
    props.setOnlineModel(onlineModel)
    onlineModel.loadModel()
    props.setOnlineModel(onlineModel)
  }
  useEffect(()=>{
    if(props.modelParams){
      loadModel(props.modelParams)
    }
  }, [props.modelParams, props.game])
  function run(){

  }
  useEffect(()=>{
    if(props.onlineModel && props.state){
      const onlineModel = props.onlineModel
      //State
      const input = props.state
      states.push(input)
      rewards.push(props.reward)
      done.push(props.done)
      //Action
      const prediction = tf.argMax(tf.tensor(onlineModel?.predictModel([input])[0]), 0).arraySync()
      props.setAction(prediction)
      actions.push(prediction)
      
      console.log(states[states.length-1], actions[actions.length-1], rewards[rewards.length-1], done[done.length-1])
      //Training
      if(states.length >= BATCH_SIZE+1){
        const history = onlineModel?.trainModel({
          'states': states,
          'actions': actions,
          'rewards': rewards,
          'done': done
        })
        onlineModel?.scoreHistory?.push(props.score)
        onlineModel?.scoreHistory?.push(props.score)
        onlineModel?.scoreHistory?.push(props.score)
        // props.setTrainingHistory(props.onlineModel?.trainingHistory)
        onlineModel?.saveModel()
        states = []
        actions = []
        rewards = []
        done = []
        props.setOnlineModel(onlineModel)
      }
    }
  }, [props.state])

  return (
    <div>
      # Samples: {props.onlineModel?.trainingHistory?.length * BATCH_SIZE}
      <button
          className="ai-button"
          onClick={() => props.onlineModel?.resetModel()}
      >
          Reset Model
      </button>
    </div>
  )
}


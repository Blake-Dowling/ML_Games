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
    props.setOnlineModel(() => {return onlineModel})
    onlineModel.loadModel()
    props.setOnlineModel(() => {return onlineModel})
  }
  useEffect(()=>{
    if(props.modelParams){
      loadModel(props.modelParams)
    }
  }, [props.modelParams, props.game])
  function run(){

      if(states.length >= BATCH_SIZE+1){
        const onlineModel = props.onlineModel
        console.debug("Before (outer): ", onlineModel?.trainingHistory)
        const history = onlineModel?.trainModel({
          'states': states,
          'actions': actions,
          'rewards': rewards,
          'done': done
        })
        // console.log(props.score)
        if(onlineModel?.scoreHistory){
          onlineModel?.scoreHistory?.push(props.score)
        }
        else{
          onlineModel.scoreHistory = [props.score]
        }

        // console.log(onlineModel)
        // props.setTrainingHistory(props.onlineModel?.trainingHistory)
        onlineModel?.saveModel()
        console.debug("After (outer): ", onlineModel?.trainingHistory)
        states = []
        actions = []
        rewards = []
        done = []
        props.setOnlineModel(prevOnlineModel => { return onlineModel})
      }
  }
  useEffect(()=>{
    if(props.onlineModel && props.state){
      //State
      states.push(props.state)
      rewards.push(props.reward)
      done.push(props.done)
      //Action
      const prediction = tf.argMax(tf.tensor(props.onlineModel?.predictModel([props.state])[0]), 0).arraySync()
      props.setAction(prediction)
      actions.push(prediction)
      run()
      // console.log(states[states.length-1], actions[actions.length-1], rewards[rewards.length-1], done[done.length-1])
      //Training
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


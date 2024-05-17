import React, {useState, useEffect} from 'react'

import { tfModel } from '../Server/ModelManagement'
const tf = require('@tensorflow/tfjs')

let onlineModel = new tfModel(2, 3, 'jump-model')
console.log(onlineModel)
let loadedModel = await onlineModel.loadModel()
if(loadedModel){
  console.log("Model loaded.")
  onlineModel.model = loadedModel
}
else{
  console.log("No model loaded.")
}

let states = []
let actions = []
let rewards = []
let done = []

export function Agent(props) {


  function run(){
    //State
    const input = props.state
    states.push(input)
    rewards.push(props.reward)
    done.push(props.done)
    //Action
    const prediction = tf.argMax(tf.tensor(onlineModel.predictModel([input])[0]), 0).arraySync()
    props.setAction(prediction)
    actions.push(prediction)
    console.log(states[states.length-1], actions[actions.length-1], rewards[rewards.length-1], done[done.length-1])
    //Training
    if(states.length >= 33){
      const history = onlineModel.trainModel({
        'states': states,
        'actions': actions,
        'rewards': rewards,
        'done': done
      })
      onlineModel.saveModel()
      states = []
      actions = []
      rewards = []
      done = []
    }
  }
  useEffect(()=>{
    run()
  }, [props.state])

  return (
    <div>
      <button
          className="ai-button"
          onClick={() => onlineModel.resetModel()}
      >
          Reset Model
      </button>
    </div>
  )
}


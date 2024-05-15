import React, {useState, useEffect} from 'react'
import './Jump.css'
import { tfModel } from '../Server/ModelManagement'

const tf = require('@tensorflow/tfjs')
let onlineModel = new tfModel(2, 2)
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

export default function Agent(props) {
  function calcRockDist(piece, rocks, WIDTH){
    let minRockDist = WIDTH
    for(let i=0; i<rocks.length; i++){
        minRockDist = Math.min(minRockDist, piece.dist(rocks[i]))
    }
    return minRockDist
  }

  function run(){
    //State
    const rockDist = calcRockDist(props.piece, props.rocks, props.WIDTH)
    const inAir = props.checkInAir(props.piece, props.HEIGHT)

    const input = [rockDist, inAir]
    states.push(input)
    const prediction = tf.argMax(tf.tensor(onlineModel.predictModel([input])[0]), 0).arraySync()
    //Action
    let curAction = prediction
    if(prediction > 0){
      props.jump()
    }
    actions.push(curAction)
    //Reward
    let reward = 1
    if(props.checkRockCollision(props.piece, props.rocks)){
      reward = -20
    }
    rewards.push(reward)
    //Done
    if(props.checkRockCollision(props.piece, props.rocks) || (props.score > 0 && props.score % 20 == 0) ){
      done.push(true)
    }
    else{
      done.push(false)
    }
    // console.log(states[states.length-1], actions[actions.length-1], rewards[rewards.length-1], done[done.length-1])
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
  }, [props.piece, props.rocks])

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


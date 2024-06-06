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
  useEffect(() => {
    props.setHighScore(Math.max(props.score, props.highScore))
  }, [props.ticks])
  async function getPrediction(){
    let prediction = await props.onlineModel?.predictModel([props.state])
    prediction = tf.argMax(tf.tensor(prediction[0]), 0).arraySync()
    props.setAction(prediction)
    actions.push(prediction)
    props.setActionBit(prevActionBit => {return !prevActionBit})
    if(states.length >= BATCH_SIZE+1){
      trainModel()
    }

    // console.debug(states[states.length-1], actions[actions.length-1], rewards[rewards.length-1], done[done.length-1])
  }
  async function trainModel(){
        const onlineModel = new tfModel(props.onlineModel.inputShape, props.onlineModel.outputShape, props.onlineModel.name)
        onlineModel.model = props.onlineModel.model
        onlineModel.trainingHistory = props.onlineModel.trainingHistory
        onlineModel.scoreHistory = props.onlineModel.scoreHistory
        const input = {
          'states': states,
          'actions': actions,
          'rewards': rewards,
          'done': done
        }
        states = []
        actions = []
        rewards = []
        done = []
        if(onlineModel?.scoreHistory){
          onlineModel?.scoreHistory?.push(props.highScore)
        }
        else{
          onlineModel.scoreHistory = [props.highScore]
        }
        props.setHighScore(0)
        const history = await onlineModel?.trainModel(input)

        onlineModel?.saveModel()
        if(onlineModel.scoreHistory.length !== 0 && (onlineModel.scoreHistory.length*BATCH_SIZE) % 50000 < BATCH_SIZE){
          onlineModel.backupModel()
        }

        props.setOnlineModel(onlineModel)

  }
  useEffect(()=>{

    // console.debug("board: ", props.board.board)
    if(props.onlineModel && props.state){
      //State
      states.push(props.state)
      rewards.push(props.reward)
      done.push(props.done)
      //Action
      getPrediction()

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


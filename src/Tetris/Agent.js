import React, {useState, useEffect} from 'react'
import './Tetris.css'
import { tfModel } from '../Server/ModelManagement'
const tf = require('@tensorflow/tfjs')

let onlineModel = new tfModel(7, 24, 'tetris-model')
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

    // ****************** Get board column heights ******************
    function getHeights(squares){
        let heights = []
        for(let i=0; i<props.WIDTH; i++){
            heights.push(0)
        }
        if(squares === null){
            return heights
        }
        for(let r=0; r<(squares?.length); r++){
            for(let c=0; c<squares[r].length; c++){
                if(squares[r][c] === 1 && heights[c] === 0){
                    heights[c] = props.HEIGHT - r
                }
            }
        }
        return heights
    }
    // ****************** Check each row for completion ******************
    function numCompleteRows(squares){
        let numComplete = 0
        for(let r=(squares?.length)-1; r>=0; r--){
            let complete = true
            for(let c=0; c<squares[r]?.length; c++){
                if(squares[r][c] == 0){
                    complete = false
                }
            }
            if(complete){
                numComplete ++
                r --
            }
        }
        return numComplete
    }
    // ****************** Check if column full ******************
    function checkFullColumn(squares){
        if(squares == null || squares.length === 0){
            return false
        }
        const topRow = squares[0]
        if(topRow.length === 0){
            return false
        }
        for(let c=0; c<topRow.length; c++){
            if(topRow[c] === 1){
                return true
            }
        }
        return false
    }
    
    function run(){
        //State
        const state = [props.block?.type].concat(getHeights(props.squares))
        states.push(state)
        //Action
        const prediction = tf.argMax(tf.tensor(onlineModel.predictModel([state])[0]), 0).arraySync()
        //Action
        let action = prediction
        props.block.orientation = parseInt(action / props.WIDTH)
        props.block.x = parseInt(action % props.WIDTH)
        actions.push(action)
        //Reward
        let reward = 0
        if(checkFullColumn(props.squares)){
            reward = -20
        }
        else if(numCompleteRows(props.squares) > 0){
            reward = 20
        }
        rewards.push(reward)
        //Done
        let curDone = (reward !== 0)
        done.push(curDone)
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
      }, [props.block, props.squares])

    // ****************** AI Press Key ******************
    function pressKey(key){
        props.keyPressCallback(key)
    }




  return (
    <div>
    </div>
  )
}

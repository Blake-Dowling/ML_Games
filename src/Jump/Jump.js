import React, {useState, useEffect} from 'react'
import './Jump.css'

import {  Board } from '../Engine/Objects.js'



const WIDTH = 8
const HEIGHT = 5

// let player = new Piece(0,4,1)
let rocks = []

export function Jump(props) {

    // function initGame(){
    //   player = new Piece(0,4,1)
    //   rocks = []
    //   props.setScore(0)
    // }

    // useEffect(() => {
    //   props.setModelParams([WIDTH+1, HEIGHT, 'jump-model-3'])
    //   props.setWIDTH(WIDTH)
    //   props.setHEIGHT(HEIGHT)
    //   initGame()
    // }, [])


    // function movePlayer(player, board, action){
    //   if(board?.grounded(player)){ //Jump
    //     if(action){
    //       player.y -= action
    //     }

    //   }
    //   else{ //Gravity
    //       player.y += 1
    //   }
    //   return new Piece(player.x, player.y, player.val)
    // }
    // function moveRocks(rocks){
    //     for(let i=0; i<rocks.length; i++){
    //         rocks[i].move(-1, 0)
    //     }
    //     return rocks
    // }
    // function checkCollision(piece, rocks){
    //   for(let i=0; i<rocks.length; i++){
    //       if(piece.colliding(rocks[i])){
    //           return true
    //       }
    //   }
    //   return false
    // }
    // function checkInAir(piece, HEIGHT){
    //   return piece.y < (HEIGHT - 1)
    // }
  
    // function calcRockDist(piece, rocks, WIDTH){
    //   let minRockDist = WIDTH
    //   for(let i=0; i<rocks.length; i++){
    //       minRockDist = Math.min(minRockDist, piece.dist(rocks[i]))
    //   }
    //   return minRockDist
    // }

    // function getGroundArray(board){
    //   const groundArray = JSON.parse(JSON.stringify(board[board.length-1])) //Copy bottom row
    //   for(let i=0; i<groundArray?.length; i++){
    //     groundArray[i] = groundArray[i] == 2
    //   }
    //   return groundArray
    // }

    // //Creates new board by moving based on current prediction.
    // //Updates state and board to trigger new prediction by Agent.
    // function getState(){
    //   //Action

    //   player = movePlayer(player, props.board, props.action)
    //   rocks = moveRocks(rocks)
    //   //State

    //   //Reward, done
    //   if(checkCollision(player, rocks)){
    //     props.setReward(-20)
    //     props.setDone(true)
    //     initGame()
    //   }
    //   else if(props.score > 0 && props.score % 20 == 0){
    //     props.setReward(20)
    //     props.setDone(true)
    //   }
    //   else{
    //     props.setReward(1)
    //     props.setDone(false)
    //   }

    //   if((props.ticks % 5 < 4) * (Math.floor(Math.random()*2))){
    //     rocks.push(new Piece(WIDTH-1, HEIGHT-1, 2))
    //   }
    //   props.setScore(prevScore => {
    //     return prevScore + 1
    //   })

    //   const newBoard = new Board(props.board?.width, props.board?.height, [player, ...rocks])

    //   const inAir = checkInAir(player, HEIGHT)

    //   const groundArray = getGroundArray(newBoard.board)

    //   props.setBoard(newBoard)
    //   props.setState([inAir, ...groundArray]) //Trigger agent render
    // }

    // //Event loop
    // useEffect(() => {
    //   if(props.board){
    //     getState()
    //   }
    // }, [props.ticks])
    // useEffect(() => {
    //   if(props.board){
    //     getState()
    //   }
    // }, [])

    return (
      <div>
          {/* <button
            className="ai-button"
            onClick={() => props.setGame(1)}
          >
            Tetris
        </button> */}
      </div>
    )
  }

import React, {useState, useEffect} from 'react'
import './Jump.css'

import { Piece, Board } from '../Engine/Objects'



const WIDTH = 8
const HEIGHT = 5

let player = new Piece(0,4,1)
let rocks = []

export function Jump(props) {

    function initGame(){
      player = new Piece(0,4,1)
      rocks = []
      props.setScore(0)
    }

    useEffect(() => {
      props.setModelParams([WIDTH+1, HEIGHT-1, 'jump-model-2'])
      props.setWIDTH(WIDTH)
      props.setHEIGHT(HEIGHT)
      initGame()
    }, [])

    function updateBoard(pieces){
      props.setBoard(prevBoard => {
        if(prevBoard){
          return new Board(prevBoard?.width, prevBoard?.height, pieces)
        }
      })
    }

    function movePlayer(player, board, action){
      if(board?.grounded(player)){ //Jump
          player.y -= action
      }
      else{ //Gravity
          player.y += 1
      }
      return new Piece(player.x, player.y, player.val)
    }
    function moveRocks(rocks){
        for(let i=0; i<rocks.length; i++){
            rocks[i].move(-1, 0)
        }
        return rocks
    }
    function checkCollision(piece, rocks){
      for(let i=0; i<rocks.length; i++){
          if(piece.colliding(rocks[i])){
              return true
          }
      }
      return false
    }
    function checkInAir(piece, HEIGHT){
      return piece.y < (HEIGHT - 1)
    }
  
    function calcRockDist(piece, rocks, WIDTH){
      let minRockDist = WIDTH
      for(let i=0; i<rocks.length; i++){
          minRockDist = Math.min(minRockDist, piece.dist(rocks[i]))
      }
      return minRockDist
    }

    function getGroundArray(board){
      const groundArray = board[board.length-1]
      for(let i=0; i<groundArray?.length; i++){
        groundArray[i] = groundArray[i] == 2
      }
      return groundArray
    }

    function run(){
      //Action
      player = movePlayer(player, props.board, props.action)
      rocks = moveRocks(rocks)
      //State

      const inAir = checkInAir(player, HEIGHT)
      const groundArray = getGroundArray(props.board.board)
      props.setState([inAir, ...groundArray])


      //Reward, done
      if(checkCollision(player, rocks)){
        props.setReward(-20)
        props.setDone(true)
        initGame()
      }
      else if(props.score % 20 == 0){
        props.setReward(20)
        props.setDone(true)
      }
      else{
        props.setReward(1)
        props.setDone(false)
      }

      if((props.ticks % 5 < 4) * (Math.floor(Math.random()*2))){
        rocks.push(new Piece(WIDTH-1, HEIGHT-1, 2))
      }
      props.setScore(prevScore => {
        return prevScore + 1
      })
      //Trigger state update, agent render
      updateBoard([player, ...rocks])

    }

    //Event loop
    useEffect(() => {
      if(props.board){
        run()
      }
    }, [props.ticks])

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

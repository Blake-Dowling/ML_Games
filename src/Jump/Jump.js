import React, {useState, useEffect} from 'react'
import './Jump.css'

import { Piece } from '../Engine/Objects'



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
      props.setWIDTH(WIDTH)
      props.setHEIGHT(HEIGHT)
      initGame()
    }, [])



    function movePlayer(player, board, action){
      if(board?.grounded(player)){ //Jump
          player.y -= 2*action
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

    function run(){
      //Trigger state update, agent render
      props.setPieces([player, ...rocks])
      //State
      const rockDist = calcRockDist(player, rocks, props.WIDTH)
      const inAir = checkInAir(player, props.HEIGHT)
      props.setState([rockDist, inAir])
      //Action
      player = movePlayer(player, props.board, props.action)
      rocks = moveRocks(rocks)
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

      if((props.ticks % 3 < 2) * (Math.floor(Math.random()*2))){
        rocks.push(new Piece(WIDTH-1, HEIGHT-1, 2))
      }
      props.setScore(prevScore => {
        return prevScore + 1
      })

    }

    //Event loop
    useEffect(() => {

      run()

    }, [props.ticks])

    return (
      <div>
        
      </div>
    )
  }

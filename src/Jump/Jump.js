import React, {useState, useEffect} from 'react'
import './Jump.css'
import Board from './Board'
import Timer from './Timer'

import Agent from './Agent'

import Piece from './Piece'
import { spawnRockRandom, moveAllRocks, jump, gravity, checkRockCollision, calcRockDist, checkInAir } from './GameMechanics'
import KeyPress from './KeyPress'


const WIDTH = 8
const HEIGHT = 5

export function Jump(props) {
    const [score, setScore] = useState(0)
    const [ticks, setTicks] = useState(0)

    const [piece, setPiece] = useState(new Piece(0,4,1))
    const [rocks, setRocks] = useState([])
    const [jumpRequested, setJumpRequested] = useState(0)

    function resetGame(){
      setPiece(new Piece(0,4,1))
      setRocks([])
      setScore(0)
    }

    //Event loop
    useEffect(() => {
      if(checkRockCollision(piece, rocks)){
        resetGame()
      }
      gravity(setPiece, HEIGHT)
      moveAllRocks(setRocks)
      if(ticks % 3 == 0){
        spawnRockRandom(setRocks, WIDTH)
      }
      if(jumpRequested === 1){
        jump(piece, setPiece, HEIGHT)
        setJumpRequested(0)
      }
      setScore(prevScore => {
        return prevScore + 1
      })
    }, [ticks])



    return (
      <div>
        Score: {score}
        <Timer
          ticks={ticks}
          setTicks={setTicks}
        />
        <Board
          ticks={ticks}
          WIDTH={WIDTH}
          HEIGHT={HEIGHT}
          piece={piece}
          rocks={rocks}
        />
        <KeyPress gameJumpHandler={() => {setJumpRequested(1)}}/>
        {/* <Test ticks={ticks}/> */}
        <Agent
          score={score}
          jump={() => {setJumpRequested(1)}}
          piece={piece}
          rocks={rocks}
          WIDTH={WIDTH}
          HEIGHT={HEIGHT}
          checkRockCollision={checkRockCollision}
          checkInAir={checkInAir}
          jumpRequested={jumpRequested} //action
        />
      </div>
    )
  }

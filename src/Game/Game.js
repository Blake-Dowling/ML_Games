import React, {useState, useEffect} from 'react'
import '../Style/Main.css'
import Board from './Board'
import Timer from '../Util/Timer'

import Agent from '../Util/Agent'

import Piece from './Piece'
import { spawnRockRandom, moveAllRocks, jump, gravity, checkRockCollision, calcRockDist, checkInAir } from './GameMechanics'
import KeyPress from '../Util/KeyPress'


const WIDTH = 4
const HEIGHT = 5

export default function Game(props) {
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
        spawnRockRandom(setRocks)
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

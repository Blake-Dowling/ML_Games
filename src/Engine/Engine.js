import React, {useState, useEffect} from 'react'
import { View } from './View'
import { Timer } from './Timer'
import { Jump } from '../Jump/Jump'
import { Tetris } from '../Tetris/Tetris'

import { Agent } from './Agent'


import KeyPress from './KeyPress'


export function Engine(props) {
    const [game, setGame] = useState(1)
    const [score, setScore] = useState(0)
    const [ticks, setTicks] = useState(0)
    const [WIDTH, setWIDTH] = useState(0)
    const [HEIGHT, setHEIGHT] = useState(0)
    const [board, setBoard] = useState(null)
    const [state, setState] = useState([0, 0])
    const [action, setAction] = useState(0)
    const [reward, setReward] = useState(0)
    const [done, setDone] = useState(false)
    const [modelParams, setModelParams] = useState(null)
    
    return (
      <div>
        Score: {score}
        <Timer
          ticks={ticks}
          setTicks={setTicks}
        />
        
        {game===0 && <Jump
            ticks={ticks}
            score={score}
            setScore={setScore}
            setWIDTH={setWIDTH}
            setHEIGHT={setHEIGHT}
            board={board}
            setBoard={setBoard}
            setState={setState}
            action={action}
            setReward={setReward}
            setDone={setDone}
            setModelParams={setModelParams}
            setGame={setGame}
        />}
        {game===1 && <Tetris
            ticks={ticks}
            score={score}
            setScore={setScore}
            setWIDTH={setWIDTH}
            setHEIGHT={setHEIGHT}
            board={board}
            setBoard={setBoard}
            setState={setState}
            action={action}
            setReward={setReward}
            setDone={setDone}
            setModelParams={setModelParams}
            setGame={setGame}
        />}
        <View
          ticks={ticks}
          WIDTH={WIDTH}
          HEIGHT={HEIGHT}
          board={board}
          setBoard={setBoard}
        />
        <KeyPress setAction={setAction}/>
        <Agent
          state={state}
          action={action}
          setAction={setAction}
          reward={reward}
          done={done}
          board={board}
          modelParams={modelParams}
        />
      </div>
    )
  }

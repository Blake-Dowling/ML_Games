import React, {useState, useEffect} from 'react'
import { View } from './View'
import { Timer } from './Timer'
import { Jump } from '../Jump/Jump'
import { Tetris } from '../Tetris/Tetris'

import { Agent } from './Agent'
import { TrainingChart } from './Chart'


import KeyPress from './KeyPress'


export function Engine(props) {
    const game = props.game
    const [score, setScore] = useState(0)
    const [highScore, setHighScore] = useState(0)
    const [ticks, setTicks] = useState(0)
    const [WIDTH, setWIDTH] = useState(0)
    const [HEIGHT, setHEIGHT] = useState(0)
    const [board, setBoard] = useState(null)
    const [state, setState] = useState(null)
    const [action, setAction] = useState(0)
    const [reward, setReward] = useState(0)
    const [done, setDone] = useState(false)
    const [modelParams, setModelParams] = useState(null)
    const [onlineModel, setOnlineModel] = useState(null)
    const [display, setDisplay] = useState(true)

    return (
      <div>
        Score: {score}
        <Timer
          ticks={ticks}
          setTicks={setTicks}
        />
        <button
            onClick={() => {setDisplay(prevDisplay => {return !prevDisplay})}}
        >
            Display
        </button>
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
            // setGame={setGame}
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
            // setGame={setGame}
        />}
        <KeyPress setAction={setAction}/>
        <Agent
          score={score}
          highScore={highScore}
          setHighScore={setHighScore}
          state={state}
          action={action}
          setAction={setAction}
          reward={reward}
          done={done}
          board={board}
          modelParams={modelParams}
          onlineModel={onlineModel}
          setOnlineModel={setOnlineModel}
        />
        {display &&
            <div>
                <View
                ticks={ticks}
                WIDTH={WIDTH}
                HEIGHT={HEIGHT}
                board={board}
                setBoard={setBoard}
                />
                <TrainingChart
                    onlineModel={onlineModel}
                />
            </div>
        }
      </div>
    )
  }

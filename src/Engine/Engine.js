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
    const [stateBit, setStateBit] = useState(false)
    const [actionBit, setActionBit] = useState(false)
    const [modelParams, setModelParams] = useState(null)
    const [onlineModel, setOnlineModel] = useState(null)
    const [displayView, setDisplayView] = useState(true)
    const [displayChart, setDisplayChart] = useState(true)

    return (
      <div>
        Score: {score}
        <Timer
          ticks={ticks}
          setTicks={setTicks}
        />
        <button
            onClick={() => {setDisplayView(prevDisplayView => {return !prevDisplayView})}}
        >
            Display View
        </button>
        <button
            onClick={() => {setDisplayChart(prevDisplayChart => {return !prevDisplayChart})}}
        >
            Display Chart
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
            stateBit={stateBit}
            setStateBit={setStateBit}
            actionBit={actionBit}
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
            stateBit={stateBit}
            setStateBit={setStateBit}
            actionBit={actionBit}
            setReward={setReward}
            setDone={setDone}
            setModelParams={setModelParams}
            // setGame={setGame}
        />}
        <KeyPress setAction={setAction}/>
        <Agent
          ticks={ticks}
          score={score}
          highScore={highScore}
          setHighScore={setHighScore}
          state={state}
          action={action}
          setAction={setAction}
          stateBit={stateBit}
          actionBit={actionBit}
          setActionBit={setActionBit}
          reward={reward}
          done={done}
          board={board}
          modelParams={modelParams}
          onlineModel={onlineModel}
          setOnlineModel={setOnlineModel}
        />

          <div>
            {displayView &&
                <View
                ticks={ticks}
                WIDTH={WIDTH}
                HEIGHT={HEIGHT}
                board={board}
                setBoard={setBoard}
                />
            }
            {displayChart &&
                <TrainingChart
                    onlineModel={onlineModel}
                />
            }
          </div>

      </div>
    )
  }

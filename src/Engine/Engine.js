import React, {useState, useEffect} from 'react'

import { View } from './View'
import { Timer } from './Timer'
import { Jump } from '../Jump/Jump'

import { Agent } from './Agent'


import KeyPress from './KeyPress'


export function Engine(props) {

    const [score, setScore] = useState(0)
    const [ticks, setTicks] = useState(0)
    const [WIDTH, setWIDTH] = useState(8)
    const [HEIGHT, setHEIGHT] = useState(5)
    const [board, setBoard] = useState(null)
    const [pieces, setPieces] = useState([])
    const [state, setState] = useState([0, 0])
    const [reward, setReward] = useState(0)
    const [done, setDone] = useState(false)
    const [action, setAction] = useState(0)



    // useEffect(() => {
    //     console.log("state: ", state)
    // }, [state])


    return (
      <div>
        Score: {score}
        <Timer
          ticks={ticks}
          setTicks={setTicks}
        />
        <Jump
            ticks={ticks}
            score={score}
            setScore={setScore}
            WIDTH={WIDTH}
            setWIDTH={setWIDTH}
            HEIGHT={HEIGHT}
            setHEIGHT={setHEIGHT}
            board={board}
            pieces={pieces}
            setPieces={setPieces}
            setState={setState}
            setReward={setReward}
            setDone={setDone}
            action={action}
        />
        <View
          ticks={ticks}
          WIDTH={WIDTH}
          HEIGHT={HEIGHT}
          board={board}
          setBoard={setBoard}
          pieces={pieces}
        />
        <KeyPress setAction={setAction}/>
        {/* <Test ticks={ticks}/> */}
        <Agent
          state={state}
          reward={reward}
          done={done}
          action={action}
          setAction={setAction}
          pieces={pieces}
        />
      </div>
    )
  }

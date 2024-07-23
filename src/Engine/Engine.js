import React, {useState, useEffect} from 'react'
import { View } from './View.js'
import { Timer } from './Timer.js'
import { KeyPress } from './KeyPress.js'
// import { Jump } from '../Jump/Jump.js'
import { Tetris } from '../Tetris/Tetris.js'
import { Snake } from '../Snake/Snake.js'
import { Mario } from '../Mario/Mario.js'
import { Ten } from '../1024/1024.js'

import { DeepQAgent, GeneticAgent } from './Agent.js'
import { TrainingChart } from './Chart.js'

// let game = undefined
// let agent = undefined

export function Engine(props) {

    const [score, setScore] = useState(0)
    const [ticks, setTicks] = useState(0)
    const [board, setBoard] = useState(null)
    const [curGame, setCurGame] = useState("ten")
    const [game, setGame] = useState(new Ten())
    const [agent, setAgent] = useState(null)

    async function init(newGame){
      let newAgent = new DeepQAgent(newGame?.modelParams)
      await newAgent.loadModel()
      newAgent = newAgent.copy()
      setAgent(newAgent)
    }
    useEffect(() => {
      init(game)
  }, []) 
    async function changeGame(){
      let newGame = undefined
      switch(curGame){
        case "tetris":
          newGame = new Tetris()
          break
        case "snake":
          newGame = new Snake()
          break
        case "mario":
          newGame = new Mario()
          break
        case "ten":
          newGame = new Ten()
          break
        setBoard(newGame?.workingBoard)
        await init(newGame)
        setGame(newGame)
      }
    }
    useEffect(() => {
      changeGame()
    }, [curGame])
    useEffect(() => {
        tick()
    }, [ticks])


    async function tick(){
      await agent?.engineCycle(game)
      setBoard(game?.getWorkingBoard())
      setScore(game?.score)
    }
    
    return (
      <div className={"Engine"}>
        <button className={"TetrisButton"} onClick={()=>{if(curGame !== "tetris"){setCurGame("tetris")}}}></button>
        <button className={"SnakeButton"} onClick={()=>{if(curGame !== "snake"){setCurGame("snake")}}}></button>
        <Timer
          ticks={ticks}
          setTicks={setTicks}
        />
          <div>

                <View
                curGame={curGame}
                agent={agent}
                score={score}
                ticks={ticks}
                board={board}
                setBoard={setBoard}
                />
            </div>
            {/* <div className={"TrainingChart"}>
                <TrainingChart
                    agent={agent}
                    ticks={ticks}
                />
            </div> */}
            {/* <div>
              <KeyPress/>
            </div> */}
      </div>
    )
  }

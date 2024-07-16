import React, {useState, useEffect} from 'react'
import { View } from './View.js'
import { Timer } from './Timer.js'
// import { Jump } from '../Jump/Jump.js'
import { Tetris } from '../Tetris/Tetris.js'
import { Snake } from '../Snake/Snake.js'

import { DeepQAgent, GeneticAgent } from './Agent.js'
import { TrainingChart } from './Chart.js'

// let game = undefined
// let agent = undefined

export function Engine(props) {

    const [score, setScore] = useState(0)
    const [ticks, setTicks] = useState(0)
    const [board, setBoard] = useState(null)
    const [curGame, setCurGame] = useState(null)
    const [game, setGame] = useState(new Tetris())
    const [agent, setAgent] = useState(null)

    useEffect(() => {

      // game = new Tetris()
      // game = new Snake()
      setAgent(new DeepQAgent(game?.modelParams))
      // agent = new GeneticAgent(game?.modelParams, 500, 500)




  }, []) //Todo: props.game
    useEffect(() => {
      let newGame = undefined
      switch(curGame){
        case "tetris":
          newGame = new Tetris()
          setBoard(newGame?.workingBoard)
          setGame(newGame)
          setAgent(prevAgent => {return new prevAgent.constructor(newGame?.modelParams)})
          break
        case "snake":
          newGame = new Snake()
          setBoard(newGame?.workingBoard)
          setAgent(prevAgent => {return new prevAgent.constructor(newGame?.modelParams)})
          setGame(newGame)
          break
      }
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
      <div>
        <button onClick={()=>{if(curGame !== "tetris"){setCurGame("tetris")}}}>Tetris</button>
        <button onClick={()=>{if(curGame !== "snake"){setCurGame("snake")}}}>Snake</button>
        Score: {score}
        <Timer
          ticks={ticks}
          setTicks={setTicks}
        />
          <div>
            {
                <View
                ticks={ticks}
                board={board}
                setBoard={setBoard}
                />
            }
            {
                <TrainingChart
                    agent={agent}
                    ticks={ticks}
                />
            }
          </div>
      </div>
    )
  }

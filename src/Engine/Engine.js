import React, {useState, useEffect} from 'react'
import { View } from './View.js'
import { Timer } from './Timer.js'
// import { Jump } from '../Jump/Jump.js'
import { Tetris } from '../Tetris/Tetris.js'
import { Snake } from '../Snake/Snake.js'

import { DeepQAgent, GeneticAgent } from './Agent.js'
// import { Genetic } from './Genetic.js'
import { TrainingChart } from './Chart.js'

let game = undefined
let agent = undefined

export function Engine(props) {

    const [score, setScore] = useState(0)

    const [ticks, setTicks] = useState(0)

    const [board, setBoard] = useState(null)

    useEffect(() => {

      // game = new Tetris()
      game = new Snake()

      agent = new DeepQAgent(game?.modelParams)
      // agent = new GeneticAgent(game?.modelParams, 500, 50)

      console.debug("Agent loaded: ", agent)

      setBoard(game.workingBoard)
  }, []) //Todo: props.game

    useEffect(() => {
        tick()
    }, [ticks])


    async function tick(){

      //Todo: eliminate this
      // if((agent?.step % agent?.sequenceLength) === 0){
      //   game?.initGame()
      // }

      await agent?.engineCycle(game)
      setBoard(game?.getWorkingBoard())
      setScore(game?.score)
    }


    return (
      <div>
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

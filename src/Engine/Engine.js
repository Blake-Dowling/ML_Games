import React, {useState, useEffect} from 'react'
import { View } from './View.js'
import { Timer } from './Timer.js'
// import { Jump } from '../Jump/Jump.js'
import { Tetris } from '../Tetris/Tetris.js'
import { Snake } from '../Snake/Snake.js'

import { Agent } from './Agent.js'
import { TrainingChart } from './Chart.js'


export function Engine(props) {
    const [game, setGame] = useState(null) //stores state, reward, done
    const [agent, setAgent] = useState(null)
    const [score, setScore] = useState(0)
    // const [highScore, setHighScore] = useState(0)
    const [ticks, setTicks] = useState(0)
    const [board, setBoard] = useState(null)
    const [action, setAction] = useState(0) //required due to asynchronous call

    const [displayView, setDisplayView] = useState(true)
    const [displayChart, setDisplayChart] = useState(true)

    async function getAction(game){
      let newAction = await agent?.getPrediction(game?.state)
      setAction(newAction)
    }
    useEffect(() => {
      // const newGame = new Tetris()
      const newGame = new Snake()
      newGame.initGame()
      setGame(newGame)
      const agent = new Agent(newGame.modelParams)
      // agent.onlineModel.loadModel()
      console.debug("Agent loaded: ", agent)
      setAgent(agent)
      setBoard(newGame.workingBoard)
  }, []) //Todo: props.game

    //Event loop
    useEffect(() => {
        let newGame = game?.getState(action)
        if(newGame?.newState){
          getAction(newGame)
        }

        let newBoard = newGame?.workingBoard
        let newScore = newGame?.score

        setBoard(newBoard)
        setScore(newScore)
    }, [ticks])

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

    {/* <div>
      # Samples: {agent?.onlineModel?.scoreHistory?.length * agent?.BATCH_SIZE}
    </div> */}
          <div>
            {displayView &&
                <View
                ticks={ticks}
                board={board}
                setBoard={setBoard}
                />
            }
            {displayChart &&
                <TrainingChart
                    agent={agent}
                    ticks={ticks}
                />
            }
          </div>

      </div>
    )
  }

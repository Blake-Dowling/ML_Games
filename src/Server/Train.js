
import { Tetris } from '../Tetris/Tetris.js'
import { Snake } from '../Snake/Snake.js'
import { DeepQAgent, GeneticAgent } from '../Engine/Agent.js'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

let game = new Tetris()
// let game = new Snake()
// game.initGame()
let agent = new DeepQAgent(game.modelParams)
await agent.loadModel()
agent = agent.copy()
// const agent = new GeneticAgent(game.modelParams, 500, 500)
// await sleep(5000)

const numBatches = 50
for(let i=0; i<numBatches; i++){
    await agent?.trainSession(game)
    await sleep(200)
    await agent?.onlineModel?.saveModel()
}

// Tetris = require('../Tetris/Tetris.js')
// Agent = require('../Engine/Agent')
import { Tetris } from '../Tetris/Tetris.js'
import { Agent } from '../Engine/Agent.js'
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

let game = new Tetris()
game.initGame()
const agent = new Agent(game.modelParams)
// agent.onlineModel.resetModel()
// console.debug(agent.onlineModel.model)
let action = 0

let highScore = 0

async function train(){
    for(let i=0; i<20000; i++){
        // sleep(100)
        console.debug(i, "-----------------------------")
        game = game?.getState(action)
        if(game?.newState){
            action = await agent?.getPrediction(game?.state, game?.reward, game?.done)
        }
    
        let newScore = game?.score
        highScore = Math.max(newScore, highScore)
        if(agent?.states.length >= agent?.BATCH_SIZE+1){
          await agent?.trainModel(highScore)
          highScore = 0
        }
    
    }
}
train()
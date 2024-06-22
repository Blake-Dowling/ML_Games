// Tetris = require('../Tetris/Tetris.js')
// Agent = require('../Engine/Agent')
import { Tetris } from '../Tetris/Tetris.js'
import { Agent } from '../Engine/Agent.js'

// const audio = document.getElementById('audio1')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

let game = new Tetris()
game.initGame()
const agent = new Agent(game.modelParams)
await sleep(5000)
// agent.onlineModel.resetModel()
// console.debug(agent.onlineModel.model)
let action = 0

let highScore = 0
console.debug(agent?.onlineModel?.trainingHistory)
async function train(){
    const startTime = performance.now()
    let numSamples = 0
    for(let i=0; i<10000000; i++){
        // await sleep(200)
        // console.debug(i, "-----------------------------")
        game = game?.getState(action)
        if(game?.newState){
            // console.debug(game.state)
            action = await agent?.getPrediction(game?.state)
            agent?.pushDataPoint(game?.state, action, game?.reward, game?.done)
        }
    
        let newScore = game?.score
        highScore = Math.max(newScore, highScore)

        if(agent?.states.length >= agent?.BATCH_SIZE+1){
            const start = performance.now()
            await agent?.trainModel(highScore)
            const end = performance.now()
            highScore = 0
            console.debug(i, "-----------------------------", (end-start)/1000, "s")
        //   await sleep(1000)
            numSamples += agent?.BATCH_SIZE
        }
    
    }
    
    await agent?.onlineModel?.saveModel()
    const endTime = performance.now()
    const minutes = parseInt((endTime-startTime)/60000, 10)
    const seconds = ((endTime-startTime)%60000)/1000
    console.log(numSamples, " samples in ", minutes, ":", seconds, ".")
    // audio.play()
    // audio.pause()
    // audio.currentTime = 0
}
train()
// Tetris = require('../Tetris/Tetris.js')
// Agent = require('../Engine/Agent')
import { Tetris } from '../Tetris/Tetris.js'
import { Snake } from '../Snake/Snake.js'
import { Agent } from '../Engine/Agent.js'

// const audio = document.getElementById('audio1')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// let game = new Tetris()
let game = new Snake()
game.initGame()
const agent = new Agent(game.modelParams)
await sleep(5000)
// agent.onlineModel.resetModel()
// console.debug(agent.onlineModel.model)

// console.debug(agent?.onlineModel)
const BATCHES_PER_SESSION = 100
async function train(session, numSessions){
    let action = 0
    let highScore = 0
    let avgHighScore = 0
    let loss = undefined
    let accuracy = undefined


    let numSamples = 0
    while(numSamples<agent?.BATCH_SIZE*BATCHES_PER_SESSION){
        // await sleep(200)
        // console.debug(i, "-----------------------------")
        game = game?.getState(action)
        if(game?.newState){

            action = await agent?.getPrediction(game?.state)
            // console.debug(game.state)
            agent?.pushDataPoint(game?.state, action, game?.reward, game?.done)
        }
    
        let newScore = game?.score
        highScore = Math.max(newScore, highScore)

        if(agent?.states.length >= agent?.BATCH_SIZE+1){
            console.log("----------------------------------------------------------")
            console.log("Batch: ", (session*BATCHES_PER_SESSION)+((numSamples/agent?.BATCH_SIZE)+1), "/", (numSessions)*(BATCHES_PER_SESSION))
            const start = performance.now()
            const history = await agent?.trainModel(highScore)
            const end = performance.now()
            loss = parseFloat(history.history.loss[0].toFixed(3))
            accuracy = parseFloat(history.history.acc[0].toFixed(3))

            console.log( ((end-start)/1000).toFixed(3), "s.")
            console.log("High Score: ", highScore)
            avgHighScore += highScore
            highScore = 0
            numSamples += agent?.BATCH_SIZE
        }
    
    }
    const prevNumSamples = agent?.onlineModel?.sampleCountHistory[agent?.onlineModel?.sampleCountHistory?.length-1]
    const newNumSamples = prevNumSamples ? prevNumSamples + numSamples : numSamples
    // console.debug(newNumSamples)
    agent?.onlineModel?.sampleCountHistory?.push(newNumSamples)
    agent?.onlineModel?.lossHistory?.push(loss)
    agent?.onlineModel?.accuracyHistory?.push(accuracy)
    agent?.onlineModel?.scoreHistory?.push(avgHighScore/BATCHES_PER_SESSION)

    await sleep(200)
    await agent?.onlineModel?.saveModel()

    // audio.play()
    // audio.pause()
    // audio.currentTime = 0
}
const startTime = performance.now()
const numBatches = 30
for(let i=0; i<numBatches; i++){
    console.log("----------------------------------------------------------")
    console.log("Session: ", i+1)
    console.log("----------------------------------------------------------")
    await train(i, numBatches)
}
const endTime = performance.now()
const minutes = parseInt((endTime-startTime)/60000, 10)
const seconds = (((endTime-startTime)%60000)/1000).toFixed(3)
console.log(numBatches*BATCHES_PER_SESSION*agent?.BATCH_SIZE, " samples in ", minutes, ":", seconds, ".")
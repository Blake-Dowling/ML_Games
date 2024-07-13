
import { Tetris } from '../Tetris/Tetris.js'
import { Snake } from '../Snake/Snake.js'
import { Genetic } from '../Engine/Genetic.js'

// const audio = document.getElementById('audio1')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// let game = new Tetris()
let game = new Snake()
game.initGame()//erase?
const agent = new Genetic(game.modelParams, 500, 10)
await sleep(5000)


const BATCHES_PER_SESSION = 1
async function train(session, numSessions){

    let highScore = 0
    let avgHighScore = 0
    let loss = undefined
    let accuracy = undefined


    let numSamples = 0


    while(numSamples<agent?.BATCH_SIZE*BATCHES_PER_SESSION){

        if((agent?.step % agent?.sequenceLength) === 0){
            game?.initGame()
          }

        const state = game?.getState()

        const action = await agent?.getPrediction(state)


        game?.move(action)
        let result = game?.getResult()

        while(!result){
            game?.move(action)
            result = game?.getResult()
        }

        const score = result?.score
        const reward = result?.reward
        const done = result?.done

        agent?.pushDataPoint(state, action, reward, done)

        highScore = Math.max(score, highScore)
        


        if(agent?.steps >= agent?.BATCH_SIZE+1){
            console.log("----------------------------------------------------------")
            console.log("Batch: ", (session*BATCHES_PER_SESSION)+((numSamples/agent?.BATCH_SIZE)+1), "/", (numSessions)*(BATCHES_PER_SESSION))
            const start = performance.now()
            console.debug(agent?.population)
            agent?.sortPopulation()
            agent?.mutatePopulation()
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
const numBatches = 50
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
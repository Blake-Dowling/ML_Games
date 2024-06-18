Tetris = require('../Tetris/Tetris')
Agent = require('./Agent')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const game = new Tetris()
game.initGame()
const agent = new Agent(newGame.modelParams)

let action = 0

let highScore = 0

async function train(){
    for(let i=0; i<10000; i++){
        sleep(100)
        let newGame = game?.getState(action)
        if(newGame?.newState){
            action = await agent?.getPrediction(game?.state, game?.reward, game?.done)
        }
    
        let newScore = newGame?.score
        highScore = Math.max(newScore, highScore)
        if(agent?.states.length >= agent?.BATCH_SIZE+1){
          agent?.trainModel(highScore)
          highScore = 0
        }
    
    }
}
train()
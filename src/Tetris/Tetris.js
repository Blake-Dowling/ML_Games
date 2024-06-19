

import { Board, Piece, TetrisBlock } from '../Engine/Objects.js'

// ******************************************************
// ****************** Main Game Component ******************
// ******************************************************
export class Tetris {
    constructor(){
        this.player = null
        this.restingPixels = []
        this.workingBoard = null
        this.score = 0
        this.reward = 0
        this.done = false
        this.state = null
        this.newState = false
        this.WIDTH = 6
        this.HEIGHT = 10
        this.modelParams = [this.WIDTH+3, 4*this.WIDTH, 'tetris-model']
        this.initGame()
    }
    initGame(){
        this.player = this.#newBlock()
        this.restingPixels = []
        this.workingBoard = new Board(this.WIDTH, this.HEIGHT, [this.player])
        this.score = 0
        // props.setScore(0)
    }

    getState(action){
        //Action
        //Player movement
        // console.debug(action)
        this.#movePlayer(action)
        this.#gravityPlayer()
        //Player movement result
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, [this.player, ...this.restingPixels])
        const blockStop = this.#checkBlockStop()
        // //New board result
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.restingPixels)
        const numCompleteRows = this.#checkCompleteRows()
        const fullColumn = this.#checkFullColumn()
        // //Remove player from board after init for following calculations
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.restingPixels)
        // //New state
        if(blockStop || numCompleteRows || fullColumn){
            const heights = this.#getHeights(this.workingBoard.board)
            const numHoles = this.#countHoles(this.workingBoard.board)
            const bumpiness = this.#getBumpiness(heights)
            //Reward
            this.reward = 0
            this.reward += (this.WIDTH) * (numCompleteRows**2) + 1
            this.score += (10 * numCompleteRows)
            this.reward -= 5 * fullColumn
            //Done
            this.done = fullColumn!==0
            //State
            this.state = [this.player.type].concat(heights).concat(numHoles).concat(bumpiness)
            this.newState = true
        }else{
            this.newState = false
        }

        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, [this.player, ...this.restingPixels])

        return this
    }
    // ****************** Spawns new block ******************
    #newBlock(){
        return new TetrisBlock(
            Math.floor(Math.random()*this.WIDTH), 
            0, 
            Math.floor(Math.random()*4),
            Math.floor(Math.random()*5),
            3
            )
    }
    // ****************** Player movement ******************
    #gravityPlayer(){
        if(!this.workingBoard?.grounded(this.player)){
              this.player.y += 1
        }
        this.player = new TetrisBlock(this.player.x, this.player.y, this.player.orientation, this.player.type)
    }
    #movePlayer(action){
        this.player.orientation = parseInt(action / this.WIDTH)
        this.player.x = parseInt(action % this.WIDTH)
        this.player = new TetrisBlock(this.player.x, this.player.y, this.player.orientation, this.player.type)
    }

    // ****************** Game mechanics ******************
    #checkBlockStop(){
        if(this.workingBoard.grounded(this.player)){
            const newPieces = []
            for(let i=0; i<this.player.pixels.length; i++){
                newPieces.push(new Piece(this.player.pixels[i].x, this.player.pixels[i].y, 1))
            }
            this.restingPixels = this.restingPixels.concat(...newPieces)
            this.player = this.#newBlock()
            return true
        }
        return false
    }
    #checkCompleteRows(){
        let numCompleteRows = 0
        for(let i=this.workingBoard.board.length-1; i>=0; i--){
            let complete = true
            for(let j=0; j<this.workingBoard.board[i].length; j++){
                if(this.workingBoard.board[i][j] !== 1){
                    complete = false
                    break
                }
            }
            if(complete){
                numCompleteRows ++
                this.workingBoard.board.splice(i, 1)
                const emptyRow = new Array(this.WIDTH).fill(0)
                this.workingBoard.board = [emptyRow, ...this.workingBoard.board]
                i ++
            }
        }
        this.restingPixels = []
        for(let i=this.workingBoard.board.length-1; i>=0; i--){
            for(let j=0; j<this.workingBoard.board[i].length; j++){
                if(this.workingBoard.board[i][j] > 0){
                    this.restingPixels.push(new Piece(j, i, this.workingBoard.board[i][j]))
                }
            }
        }
        return numCompleteRows
    }
    #checkFullColumn(){
        for(let i=0; i<this.workingBoard.board[0].length; i++){
            if(this.workingBoard.board[0][i] > 0){
                this.initGame()
                return 1
            }
        }
        return 0
    }
    // ****************** State functions ******************
    #getHeights(){
        let heights = []
        for(let i=0; i<this.WIDTH; i++){
            heights.push(0)
        }
        if(!this.workingBoard || !this.workingBoard.board){
            return heights
        }
        for(let r=0; r<(this.workingBoard?.board?.length); r++){
            for(let c=0; c<this.workingBoard?.board[r].length; c++){
                if(this.workingBoard?.board[r][c] === 1 && heights[c] === 0){
                    heights[c] = this.HEIGHT - r
                }
            }
        }
        return heights
    }
    #countHoles(){
        let numHoles = 0
        for(let r=0; r<this.workingBoard?.board?.length-1; r++){
            for(let c=0; c<this.workingBoard?.board[r].length; c++){
                if(this.workingBoard?.board[r][c] > 0){
                    let depth = 1
                    while(r+depth < this.workingBoard?.board?.length && this.workingBoard?.board[r+depth][c] === 0){
                        numHoles ++
                        depth ++
                    }
                }
            }
        }
        return numHoles
    }
    #getBumpiness(heights){
        let bumpiness = 0
        for(let c=1; c<heights.length; c++){
            bumpiness = bumpiness + Math.abs(heights[c] - heights[c-1])
        }
        return bumpiness
    }

}

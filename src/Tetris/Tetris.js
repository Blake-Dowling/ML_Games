

import { Board, Pixel, TetrisBlock } from '../Engine/Objects.js'

// ******************************************************
// ****************** Main Game Component ******************
// ******************************************************
export class Tetris {
    constructor(){
        this.reward = 0
        this.done = false
        this.state = null
        this.WIDTH = 6
        this.HEIGHT = 10
        this.modelParams = [this.WIDTH+3, 4*this.WIDTH, 'tetris-model-2']
        this.initGame()
    }
    initGame(){
        this.newState = true
        this.action = 0
        this.blockStopped = false
        this.completeRows = new Set()
        this.fullColumn = false
        this.player = this.#newBlock()
        this.restingPixels = []
        this.workingBoard = new Board(this.WIDTH, this.HEIGHT, this.player.pixels)
        this.score = 0
        // props.setScore(0)
    }
    move(){
        // console.debug(this.action)
        const blockWasStopped = this.blockStopped
        
        if(this.blockStopped){
            this.#handleBlockStopped()
            this.blockStopped = false
        }
        if(this.completeRows.size > 0){
            this.#handleCompleteRows()
        }
        if(this.fullColumn){
            this.#handleFullColumn()
            this.fullColumn = false
        }
        this.#movePlayer()
        // console.debug(blockWasStopped)
        if(!blockWasStopped){
            this.#gravityPlayer()

        }

        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, [...this.player.pixels, ...this.restingPixels])
        // console.debug(this.workingBoard?.pixels)
    }
    getState(){

        //Player movement result

        this.#checkBlockStopped()
        // console.debug(this.player.pixels)
        // console.debug(this.restingPixels)
        // //New board result
        // console.debug(this.blockStopped)
        this.#checkCompleteRows()

        this.#checkFullColumn()
        
        if(this.completeRows.size || this.fullColumn){
            this.newState = true
        }


        // //Remove player from board after init for following calculations
        // console.debug(this.blockStopped)
        // console.debug(this.newState)
        // console.debug(this.completeRows)
        // //New state
        if(this.newState){


            this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.restingPixels)
            const heights = this.#getHeights(this.workingBoard.board)
            const numHoles = this.#countHoles(this.workingBoard.board)
            const bumpiness = this.#getBumpiness(heights)
            //Reward
            this.reward = 0
            this.reward += (this.WIDTH) * (this.completeRows.size**2) + 1
            this.score += (10 * this.completeRows.size)
            this.reward -= 5 * Number(this.fullColumn)
            //Done
            this.done = this.fullColumn===true
            //State

            this.state = [this.player.type].concat(heights).concat(numHoles).concat(bumpiness)
            // console.debug(this.state, this.reward, this.done)
        }
        //Action
        //Player movement

        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, [...this.player.pixels, ...this.restingPixels])

    }
    // ****************** Spawns new block ******************
    #newBlock(){
        this.newState = true
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
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.restingPixels)
        if(!this.workingBoard?.grounded(this.player.pixels)){
              this.player.y += 1
        }
        this.player = new TetrisBlock(this.player.x, this.player.y, this.player.orientation, this.player.type)
    }
    #movePlayer(){
        this.player.orientation = parseInt(this.action / this.WIDTH)
        this.player.x = parseInt(this.action % this.WIDTH)
        this.player = new TetrisBlock(this.player.x, this.player.y, this.player.orientation, this.player.type)
    }

    // ****************** Game mechanics ******************
    #checkBlockStopped(){
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.restingPixels)
        this.blockStopped = this.workingBoard.grounded(this.player.pixels)
        // console.debug(this.blockStopped)
    }
    #handleBlockStopped(){
        const newPixels = []
        for(let i=0; i<this.player.pixels.length; i++){
            newPixels.push(new Pixel(this.player.pixels[i].x, this.player.pixels[i].y, 1))
        }
        this.restingPixels = this.restingPixels.concat(newPixels)
        this.player = this.#newBlock()
    }
    #checkCompleteRows(){
        if(!this.blockStopped){
            this.completeRows = new Set()
            return
        }
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, [...this.player.pixels, ...this.restingPixels])
        for(let i=this.workingBoard.board.length-1; i>=0; i--){
            let rowComplete = true
            for(let j=0; j<this.workingBoard.board[i].length; j++){
                if(this.workingBoard.board[i][j] === 0){
                    rowComplete = false
                    break
                }
            }
            if(rowComplete){
                this.completeRows.add(i)
            }
        }
    }
    #handleCompleteRows(){
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.restingPixels)

        for(let i=0; this.completeRows.size && i<this.workingBoard.board.length; i++){
            if(this.completeRows.has(i)){
                this.workingBoard.board.splice(i, 1)
                const emptyRow = new Array(this.WIDTH).fill(0)
                this.workingBoard.board = [emptyRow, ...this.workingBoard.board]
                this.completeRows.delete(i)
            }
        }
        this.restingPixels = []
        for(let i=this.workingBoard.board.length-1; i>=0; i--){
            for(let j=0; j<this.workingBoard.board[i].length; j++){
                if(this.workingBoard.board[i][j] > 0){
                    this.restingPixels.push(new Pixel(j, i, this.workingBoard.board[i][j]))
                }
            }
        }
    }
    #checkFullColumn(){
        if(this.completeRows.size !== 0){
            this.fullColumn = false
            return
        }
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.restingPixels)
        for(let i=0; i<this.workingBoard.board[0].length; i++){
            if(this.workingBoard.board[0][i] > 0){
                this.fullColumn = true
                return
            }
        }
        this.fullColumn = false
    }
    #handleFullColumn(){
        this.initGame()
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

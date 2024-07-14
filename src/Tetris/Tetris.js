

import { Board, Pixel, TetrisBlock } from '../Engine/Objects.js'

class Result {
    constructor(score, reward, done){
        this.score = score
        this.reward = reward
        this.done = done
    }
}
// ******************************************************
// ****************** Main Game Component ******************
// ******************************************************
export class Tetris {
    constructor(){

        this.WIDTH = 6
        this.HEIGHT = 10
        this.modelParams = ['tetris-model-2', this.WIDTH+3, 4*this.WIDTH]//6
        this.initGame()
    }
    initGame(){

        this.player = this.#newBlock()
        this.restingPixels = []
        this.workingBoard = new Board(this.WIDTH, this.HEIGHT, this.player.pixels)
        this.score = 0
        // props.setScore(0)
    }
    getWorkingBoard(){
        return new Board(this.workingBoard.width, this.workingBoard.height, [...this.player.pixels, ...this.restingPixels])
    }
    move(action){

        this.#movePlayer(action)

        this.#gravityPlayer()



        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, [...this.player.pixels, ...this.restingPixels])
        return this.workingBoard
        // console.debug(this.workingBoard?.pixels)
    }
    getState(){
        const heights = this.#getHeights()
        const numHoles = this.#countHoles()
        const bumpiness = this.#getBumpiness(heights)
        return [this.player.type].concat(heights).concat(numHoles).concat(bumpiness)

    }
    getResult(){

        const blockStopped = this.#checkBlockStopped()
        if(!blockStopped){
            this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, [...this.player.pixels, ...this.restingPixels])
            return null
        }
        let completeRows = new Set()
        let fullColumn = false

        this.#handleBlockStopped()
        completeRows = this.#checkCompleteRows()
        this.#handleCompleteRows(completeRows)
        fullColumn = this.#checkFullColumn()
        this.#handleFullColumn(fullColumn)

        //Reward
        let reward = 0
        reward += (this.WIDTH) * (completeRows.size**2) + 1

        this.score += (10 * completeRows.size)

        reward -= 5 * Number(fullColumn)
        //Done
        let done = fullColumn===true
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, [...this.player.pixels, ...this.restingPixels])
        return new Result(this.score,
                            reward,
                            done
        )

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
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.restingPixels)
        if(!this.workingBoard?.grounded(this.player.pixels)){
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
    /**
     * @returns {boolean} whether active player block is grounded
     */
    #checkBlockStopped(){
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.restingPixels)
        return this.workingBoard.grounded(this.player.pixels)
    }
    /**
     * Converts player's pixels into resting pixels. Spawns new player.
     * @returns {null} nothing
     */
    #handleBlockStopped(){
        const newPixels = []
        for(let i=0; i<this.player.pixels.length; i++){
            newPixels.push(new Pixel(this.player.pixels[i].x, this.player.pixels[i].y, 1))
        }
        this.restingPixels = this.restingPixels.concat(newPixels)
        this.player = this.#newBlock()
    }
    /**
     * @returns {Set} indices of rows that are full after block has stopped
     */
    #checkCompleteRows(){
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.restingPixels)
        const completeRows = new Set()
        for(let i=this.workingBoard.board.length-1; i>=0; i--){
            let rowComplete = true
            for(let j=0; j<this.workingBoard.board[i].length; j++){
                if(this.workingBoard.board[i][j] === 0){
                    rowComplete = false
                    break
                }
            }
            if(rowComplete){
                completeRows.add(i)
            }
        }
        return completeRows
    }
    /**
     * Removes completed lines from resting pixels.
     * @returns {null} nothing
     */
    #handleCompleteRows(completeRows){
        if(!completeRows || !completeRows.size){
            return
        }
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.restingPixels)
        for(let i=0; completeRows.size && i<this.workingBoard.board.length; i++){
            if(completeRows.has(i)){
                this.workingBoard.board.splice(i, 1)
                const emptyRow = new Array(this.WIDTH).fill(0)
                this.workingBoard.board = [emptyRow, ...this.workingBoard.board]
                // completeRows.delete(i)
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
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.restingPixels)
        for(let i=0; i<this.workingBoard.board[0].length; i++){
            if(this.workingBoard.board[0][i] > 0){
                return true
            }
        }
        return false
    }
    #handleFullColumn(fullColumn){
        if(fullColumn){
            this.initGame()
        }
    }
    // ****************** State functions ******************
    #getHeights(){
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.restingPixels)
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
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.restingPixels)
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

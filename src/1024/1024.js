import { Board, Pixel } from '../Engine/Objects.js'
import seedrandom from 'seedrandom'
class Result {
    constructor(score, reward, done){
        this.score = score
        this.reward = reward
        this.done = done
    }
}
export class Ten {
    constructor(){
        this.WIDTH = 4
        this.HEIGHT = 4
 

        this.modelParams = ['ten-model', 16, 5] //7
        this.initGame()
    }
    initGame(){
        this.score = 0
        this.ticksSinceMoved = 0
        this.pieces = []

        this.#newPiece()
    }
    getWorkingBoard(){
        return new Board(this.WIDTH, this.HEIGHT, this.pieces)
    }
    // ****************** Spawns new block ******************

    #newPiece(){
        let board = this.getWorkingBoard()
        if(this.#checkFull()){
            return
        }
        let newPiece = undefined
        while(!(newPiece && !board.collisionPixel(newPiece))){
            newPiece = new Pixel(Math.floor(Math.random()*this.WIDTH), Math.floor(Math.random()*this.HEIGHT), Number(Math.floor(Math.random()*6)==0)+1)
        }
        this.pieces.push(newPiece)
    }
    keyToAction(keysPressed){
        let action = 0
        for(let i=0; i<keysPressed.length; i++){
            switch(keysPressed[i]){
                case "ArrowRight":
                    action = 1
                    break
                case "ArrowDown":
                    action = 2
                    break
                case "ArrowLeft":
                    action = 3
                    break
                case "ArrowUp":
                    action = 4
                    break
            }
        }
        return action
    }
    #movePieces(action){
        if(action == 0){
            return
        }
        const board = this.getWorkingBoard()
        if(!board?.board?.length || !(board?.board?.length == board?.board[0].length)){
            return
        }
        let initR = action == 1 || action == 2 ? board.board.length-2 : 1
        let initC = action == 1 || action == 4 ? board.board[0].length-2 : 1
        const r = { value: initR }
        const c = { value: initC }
        let checkOuter = action == 1 || action == 2 ? (x) => {return x.value>=0} : (x) => {return x.value<board.board.length}
        let checkInner = action == 1 || action == 4 ? (x) => {return x.value>=0} : (x) => {return x.value<board.board.length}
        let incOuter = action == 1 || action == 2 ? (x) => x.value-- : (x) => x.value++
        let incInner = action == 1 || action == 4 ? (x) => x.value-- : (x) => x.value++
        let nextR = action == 1 || action == 3 ? 0 : action == 2 ? 1 : -1
        let nextC = action == 2 || action == 4 ? 0 : action == 1 ? 1 : -1
        const outer = action == 1 || action == 3 ? c : r
        const inner = action == 2 || action == 4 ? c : r

        while(checkOuter(outer)){
            inner.value = initC
            // console.debug(inner.value)
            while(checkInner(inner)){

                if(board.board[r.value+nextR][c.value+nextC] == 0){
                    board.board[r.value+nextR][c.value+nextC] = board.board[r.value][c.value]
                    board.board[r.value][c.value] = 0
                    this.ticksSinceMoved = 0
                }
                else if(board.board[r.value+nextR][c.value+nextC] == board.board[r.value][c.value]){
                    board.board[r.value+nextR][c.value+nextC] *= 2
                    board.board[r.value][c.value] = 0
                    this.score ++
                    this.ticksSinceMoved = 0
                }
                incInner(inner)
            }
            incOuter(outer)
        }

        this.pieces = board.getPixels()
    }



    getState(){
        return this.board?.board.flat()
    }
    move(action){

        this.#movePieces(action)
        if(action){
            this.#newPiece()
        }

    }
    getResult(){
        this.ticksSinceMoved ++
        const timeout = this.ticksSinceMoved >= 10

        const full = this.#checkFull()
        if(full || timeout){
            this.initGame()
        }
        let reward = full || timeout ? -10 : this.#calcBoardValue()
        let done = full || timeout
        return new Result(this.score, reward, done)
    }


    #checkFull(){
        let board = this.getWorkingBoard()
        if(board.pixels.length >= board.width * board.height){
            return true
        }
        return false
    }
    #calcBoardValue(){
        let value = 0
        for(let i=0; i<this.pieces.length; i++){
            value += this.pieces[i].val
        }
        return value
    }



}
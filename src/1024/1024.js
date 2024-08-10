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
    #rotateBoard(prevBoard, numRotations){
        let prevBoardCopy = prevBoard.map(row => row.slice())
        const newBoard = prevBoard.map(row => row.slice())
        numRotations = ((numRotations % 4) + 4) % 4
        for(let i=0; i<numRotations; i++){
            for(let r=0; r<prevBoardCopy.length; r++){
                for(let c=0; c<prevBoardCopy.length; c++){
                    let newRow = c
                    let newColumn = (newBoard[c].length - 1) - r
                    newBoard[newRow][newColumn] = prevBoardCopy[r][c]
                }
            }
            prevBoardCopy = newBoard.map(row => row.slice())
        }
        return newBoard
    }
    // #addRow(){}
    #movePieces(action){
        let moved = false
        if(action == 0){
            return moved
        }
        const board = this.getWorkingBoard()
        if(!board?.board?.length || !(board?.board?.length == board?.board[0].length)){
            return moved
        }
        let workingBoard = board.board
        // console.debug(action, workingBoard)
        workingBoard = this.#rotateBoard(workingBoard, -(action-1))
        for(let r=0; r<workingBoard.length; r++){
            //Add row
            for(let c1=workingBoard[r].length-1; c1>=1; c1--){
                if(workingBoard[r][c1] == 0){
                    continue
                }
                for(let c2=c1-1; c2>=0; c2--){
                    if(workingBoard[r][c2] != 0 && workingBoard[r][c1] != workingBoard[r][c2]){
                        break
                    }
                    if(workingBoard[r][c1] == workingBoard[r][c2]){
                        workingBoard[r][c1] *= 2
                        workingBoard[r][c2] = 0
                        moved = true
                        break
                    }
                }
            }
            //Move columns
            let pops = workingBoard[r].length
            let c = workingBoard[r].length - 1
            while(pops > 0 && workingBoard[r][c] >= 0){
                if(workingBoard[r][c] == 0){
                    workingBoard[r].unshift(workingBoard[r].splice(c, 1))
                    if(workingBoard[r][c] != 0){
                        moved = true
                    }
                }
                else{
                    c --
                }
                pops --
            }

        }
        workingBoard = this.#rotateBoard(workingBoard, (action-1))
        // console.debug(workingBoard)
        board.board = workingBoard
        board.update()
        // console.debug(board.board)
        this.pieces = board.getPixels()
        // console.debug(this.pieces)
        return moved
    }



    getState(){
        return this.board?.board.flat()
    }
    move(action){

        const moved = this.#movePieces(action)
        if(action && moved){
            this.#newPiece()
        }

    }
    getResult(){
        this.ticksSinceMoved ++
        const timeout = false//this.ticksSinceMoved >= 10

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
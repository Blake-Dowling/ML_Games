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
 

        this.modelParams = ['ten-model', 16, 4] //7
        this.initGame()
    }
    initGame(){
        this.score = 0
        this.pieces = []
        this.#newPiece()
    }
    getWorkingBoard(){
        return new Board(this.WIDTH, this.HEIGHT, this.pieces)
    }
    // ****************** Spawns new block ******************

    #newPiece(){
        let board = this.getWorkingBoard()
        let newPiece = undefined
        while(!(newPiece && !board.collisionPixel(newPiece))){
            newPiece = new Pixel(Math.floor(Math.random()*this.WIDTH), Math.floor(Math.random()*this.HEIGHT), (Math.floor(Math.random()*4)%4)+1)
        }
        this.pieces.push(newPiece)
    }
    #movePieces(action){
        console.debug(this.pieces)
        const board = this.getWorkingBoard()
        for(let i=board.board.length-2; i>=0; i--){
            for(let j=0; j<board.board[i].length; j++){
                if(board.board[i+1][j] == 0){
                    board.board[i+1][j] = board.board[i][j]
                    board.board[i][j] = 0
                }
                else if(board.board[i+1][j] == board.board[i][j]){
                    board.board[i+1][j] *= 2
                    board.board[i][j] = 0
                }
            }
        }

        this.pieces = board.getPixels()
        console.debug(this.pieces)
    }



    getState(){

    }
    move(action){

        this.#movePieces(action)
    }
    getResult(){
        
    }



}
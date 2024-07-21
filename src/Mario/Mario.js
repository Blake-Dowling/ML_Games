import { Pixel, MarioBoard, MarioPipe, MarioPlatform, MarioPlayer } from '../Engine/Objects.js'

class Result {
    constructor(score, reward, done){
        this.score = score
        this.reward = reward
        this.done = done
    }
}
class Player {
    constructor(x, y){
        this.piece = new MarioPlayer(x, y)
    }
    move(board){
        const inAir = !board.grounded(this.piece)
        //Gravity
        if(inAir){
            this.piece.move(0, 1)
        }
    }
}
class MainPlayer extends Player{
    constructor(x, y){
        super(x, y)
    }
    move(objects, enemies, board, jumpRequested, moveDirection){
        const inAir = !board.grounded(this.piece)
        super.move(board)
        //Jump
        if(jumpRequested && (!inAir)){
            for(let i=0; i<3 && !board.collision(new MarioPlayer(this.piece.x, this.piece.y-1)); i++){
                this.piece.move(0, -1)
            }
        }
        //Move
        
        if((moveDirection!=0) && !board.collision(new MarioPlayer(this.piece?.x+(moveDirection), this.piece?.y))){
            for(let i=0; i<objects?.length; i++){
                objects[i].move(-moveDirection, 0)
            }
            
            for(let i=0; i<enemies?.length; i++){
                enemies[i].piece.move(-moveDirection, 0)
            }
        }
    }
    
}
class Goomba extends Player{
    constructor(x, y){
        super(x, y)
        this.direction = -1
    }
    move(board){
        console.debug(this.piece)
        super.move(board)
        if(board.collision(new MarioPlayer(this.piece.x+this.direction, this.piece.y))){
            this.direction *= -1
        }
        else{
            this.piece.move(this.direction, 0)
        }
    }
}
export class Mario {
    constructor(){
        this.WIDTH = 10
        this.HEIGHT = 10

        this.objects = []

        this.modelParams = ['mario-model', 100, 4] //7
        this.initGame()
    }
    initGame(){
        this.score = 0
        this.clearGame()

    }
    clearGame(){
        this.objects = []
        this.enemies = []
        this.objects.push(new MarioPlatform(0, 9, 60)) //ground
        // this.objects.push(new MarioPlatform(13, 9, 10))
        // this.objects.push(new MarioPlatform(27, 9, 10))
        this.objects.push(new MarioPlatform(10, 5, 6)) //platform 1
        this.enemies.push(new Goomba(8, 8)) //goomba 1
        this.enemies.push(new Goomba(18, 8)) //goomba 1
        this.objects.push(new MarioPipe(19, 8, 2)) //pipe 1
        this.objects.push(new MarioPipe(27, 8, 3)) //pipe 2
        this.enemies.push(new Goomba(30, 8)) //goomba 2
        this.objects.push(new MarioPipe(32, 8, 4)) //pipe 3
        
        this.player = this.#newPlayer()
        this.ticks = 0
    }
    #newPlayer(){
        return new MainPlayer(3, 8)
    }
    getWorkingBoard(){
        let pixels = []
        for(let i=0; i<this.objects.length; i++){
            pixels = pixels.concat(this.objects[i].pixels)
        }
        pixels = pixels.concat(this.player.piece.pixels)
        for(let i=0; i<this.enemies.length; i++){
            pixels = pixels.concat(this.enemies[i].piece.pixels)
        }
        return new MarioBoard(this.WIDTH, this.HEIGHT, pixels)
    }
    getBoard(pieces){
        let pixels = []
        for(let i=0; i<pieces.length; i++){
            pixels = pixels.concat(pieces[i].pixels)
        }
        return new MarioBoard(this.WIDTH, this.HEIGHT, pixels)
    }
    // ****************** Spawns new block ******************






    getState(){
        const workingBoard = this.getWorkingBoard()
        return workingBoard.board?.flat()
    }
    move(action){
        let workingBoard = this.getBoard(this.objects)
        for(let i=0; i<this.enemies.length; i++){
            this.enemies[i].move(workingBoard)
        }
        const enemyPieces = []
        for(let i=0; i<this.enemies.length; i++){
            enemyPieces.push(this.enemies[i].piece)
        }
        action = 3
        
        const jumpRequested = action == 2 || action == 3
        const moveDirection = action == 1 || action == 3 ? 1 : 0
        this.player.move(this.objects, this.enemies, workingBoard, jumpRequested, moveDirection)

    }
    getResult(){
        this.ticks ++
        const timeout = this.#checkTimeout()
        let reward = 0
        const workingBoard = this.getBoard(this.objects)
        const OB = workingBoard.pieceOB(this.player.piece)
        reward -= 10 * (OB || timeout)
        let done = OB || timeout
        if(OB){
            this.initGame()
        }
        return new Result(this.score,
            reward,
            done
        )
    }
    #checkTimeout(){
        return this.ticks > 100
    }



}
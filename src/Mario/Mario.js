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
    overLapping(otherPlayer){
        return this.piece.overLapping(otherPlayer.piece)
    }
}
class MainPlayer extends Player{
    constructor(x, y){
        super(x, y)
    }
    move(objects, enemies, board, jumpRequested, moveDirection){
        for(let i=0; i<enemies?.length; i++){
            if(this.overLapping(enemies[i])){
                return 0
            }
        }
        let inAir = !board.grounded(this.piece)
        for(let i=0; i<enemies.length; i++){
            if(this.piece.onTopOf(enemies[i].piece)){
                inAir = false
                enemies[i].dead = true
            }
        }
        super.move(board)
        //Jump
        if(jumpRequested && (!inAir)){
            for(let i=0; i<5 && !board.collision(new MarioPlayer(this.piece.x, this.piece.y-1)); i++){
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
            return moveDirection
        }
        return 0
    }
    
}
class Goomba extends Player{
    constructor(x, y){
        super(x, y)
        this.direction = -1
        this.dead = false
    }
    move(board){
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

        this.modelParams = ['mario-model', 100, 5] //7
        this.initGame()
    }
    initGame(){
        this.score = 0
        this.clearGame()

    }
    clearGame(){
        this.objects = []
        this.enemies = []
        this.objects.push(new MarioPipe(0, 8, 10)) //Left bound
        this.objects.push(new MarioPlatform(0, 9, 44)) //ground
        // this.objects.push(new MarioPlatform(13, 9, 10))
        // this.objects.push(new MarioPlatform(27, 9, 10))
        this.objects.push(new MarioPlatform(10, 5, 6)) //platform 1
        this.enemies.push(new Goomba(8, 8)) //goomba 1
        this.enemies.push(new Goomba(19, 8)) //goomba 2
        this.objects.push(new MarioPipe(19, 8, 2)) //pipe 1
        this.objects.push(new MarioPipe(27, 8, 4)) //pipe 2
        this.enemies.push(new Goomba(30, 8)) //goomba 3
        this.objects.push(new MarioPipe(31, 8, 6)) //pipe 3
        this.enemies.push(new Goomba(34, 8)) //goomba 4
        this.enemies.push(new Goomba(36, 8)) //goomba 5
        this.objects.push(new MarioPipe(37, 8, 4)) //pipe 3

        this.objects.push(new MarioPlatform(48, 9, 40)) //ground
        
        this.player = this.#newPlayer()
        this.ticks = 0
        this.distanceMoved = 0
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
    #checkCollision(){
        for(let i=0; i<this.enemies.length; i++){
            if(this.player.overLapping(this.enemies[i])){
                return true
            }
        }
        return false
    }
    // #checkCrush(){
    //     const crushedEnemies = []
    //     for(let i=0; i<this.enemies.length; i++){
    //         const enemy = this.enemies[i]
    //         if(enemy instanceof Goomba && this.player.piece.onTopOf(enemy.piece)){
    //             crushedEnemies.push(enemy)
    //         }
    //     }
    //     return crushedEnemies
    // }
    #handleDead(){
        for(let i=this.enemies.length-1; i>=0; i--){
                if(this.enemies[i].dead){
                    console.debug(this.enemies)
                    this.enemies.splice(i, 1)
                    console.debug(this.enemies)
                }
        }
    }





    getState(){
        const workingBoard = this.getWorkingBoard()
        return workingBoard.board?.flat()
    }
    move(action){
        // action=1
        // console.debug(action)
        let workingBoard = this.getBoard(this.objects)
        for(let i=0; i<this.enemies.length; i++){
            this.enemies[i].move(workingBoard)
        }
        
        let jumpRequested = action == 3 || action == 4
        const moveDirection = action == 1 || action == 3 ? -1 : action == 2 || action == 4 ? 1 : 0
        this.distanceMoved = this.player.move(this.objects, this.enemies, workingBoard, jumpRequested, moveDirection)
        this.score += this.distanceMoved
    }
    getResult(){
        this.ticks ++
        const timeout = this.#checkTimeout()
        let reward = 0
        const workingBoard = this.getBoard(this.objects)
        const OB = workingBoard.pieceFallen(this.player.piece)
        // const crushedEnemies = this.#checkCrush()
        this.#handleDead()
        const collision = this.#checkCollision()

        let done = OB || timeout || collision
        if(this.score >= 28){
            reward = 5
        }
        // reward += this.distanceMoved

        reward -= 10 * Number(done)
        // console.debug(reward)
        if(done){
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
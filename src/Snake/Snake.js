import { Board, Pixel } from '../Engine/Objects.js'

class Result {
    constructor(score, reward, done){
        this.score = score
        this.reward = reward
        this.done = done
    }
}
export class Snake {
    constructor(){
        this.WIDTH = 10
        this.HEIGHT = 10
        this.direction = 0
        this.snakePixels = []
        this.food = undefined

        this.modelParams = [12, 3, 'snake-model-2'] //1
        this.initGame()
    }
    initGame(){
        this.score = 0
        this.clearGame()
    }
    clearGame(){
        this.snakePixels = this.#newPlayer()
        this.#newFood()
        this.workingBoard = new Board(this.WIDTH, this.HEIGHT, [...this.snakePixels, this.food])
        this.ticksSinceAte = 0
    }
    // ****************** Spawns new block ******************
    #newPlayer(){
        return [new Pixel(Math.floor(Math.random()*this.WIDTH), Math.floor(Math.random()*this.HEIGHT), 3)]
    }
    #newFood(){
        let foodOnSnake = true
        while(foodOnSnake){
            this.food = new Pixel(Math.floor(Math.random()*this.WIDTH), Math.floor(Math.random()*this.HEIGHT), 1)
            let thisFoodOnSnake = false
            for(let i=0; i<this.snakePixels.length; i++){
                if(this.snakePixels[i].colliding(this.food)){
                    thisFoodOnSnake = true
                    break
                }
            }
            if(thisFoodOnSnake === false){
                foodOnSnake = false
            }
        }
        this.ticksSinceAte = 0
    }
    #movePlayer(action){
        // actions: 0 left, 1 straight, 2 right
        // console.debug("--------------------------------------------")
        // console.debug(this.direction, action)
        this.direction = (((this.direction + (parseInt(action) - 1)) % 4) + 4) % 4
        // console.debug(this.direction)
        const newHead = new Pixel(this.snakePixels[0].x, this.snakePixels[0].y, this.snakePixels[0].val)
        // console.debug(newHead)
        switch(this.direction){
            case 0:
                newHead.x += 1
                break
            case 1:
                newHead.y += 1
                break
            case 2:
                newHead.x -= 1
                break
            case 3:
                newHead.y -= 1
                break
            default:
                break
        }
        this.snakePixels.unshift(newHead)
    }
    #checkCollision(){
        const ob = this.workingBoard.ob(this.snakePixels[0])
        if(ob){
            return true
        }
        let selfCollision = false
        for(let i=1; i<this.snakePixels.length; i++){
            if(this.snakePixels[i].colliding(this.snakePixels[0])){
                selfCollision = true
            }
        }
        return selfCollision
    }
    #checkTimeout(){
        return this.ticksSinceAte > 2 * (this.workingBoard?.width * this.workingBoard?.height)
    }
    #handleCollisionOrTimeout(collisionOrTimeout){
        if(collisionOrTimeout){

            this.initGame()
        }
    }
    #checkAte(){
        return this.snakePixels[0]?.colliding(this.food)

    }
    #handleAte(ate){
        if(ate){
            if(this.snakePixels.length === (this.WIDTH * this.HEIGHT)){
                this.clearGame()
            }
            this.#newFood()
        }
        else{
            this.snakePixels.pop()
        }
    }
    getState(){

        // const wallDistanceArray = this.#getWallDistanceArray()
        // const selfDistanceArray = this.#getSelfDistanceArray()
        const wallDistanceArray = this.#getDangerArray(this.#pixelOnSnake.bind(this))
        const selfDistanceArray = this.#getDangerArray(this.workingBoard?.ob.bind(this.workingBoard))
        const foodDistanceArray = this.#getFoodDistanceArray()
        const relativeTailDirection = this.#getRelativeTailDirection()
        // console.debug(this.snakePixels)
        // console.debug(this.direction, this.snakePixels[0], this.snakePixels[this.snakePixels.length-1])
        // console.debug(relativeTailDirection)
        return [this.snakePixels.length].concat([relativeTailDirection]).concat(wallDistanceArray).concat(selfDistanceArray).concat(foodDistanceArray)

        // this.state = [this.direction].concat([this.snakePixels.length]).concat(dangerArray).concat(foodDirectionArray)

    }
    move(action){

        this.#movePlayer(action)
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, [...this.snakePixels, this.food])
        return this.workingBoard
    }
    getResult(){
        const ate = this.#checkAte()
        this.#handleAte(ate)

        this.ticksSinceAte += 1
        const timeout = this.#checkTimeout()

        const collision = this.#checkCollision()
        this.#handleCollisionOrTimeout(collision || timeout)
        this.score += (10 * ate)
        let reward = 0
        reward += ate * 10//(this.score**2)
        reward -= 10 * (collision || timeout)
        //Done
        const done = collision || timeout

        this.workingBoard = new Board(this.WIDTH, this.HEIGHT, [...this.snakePixels, this.food])

        return new Result(this.score, reward, done)

    }
    #pixelOnSnake(pixel){
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.snakePixels)
        return this.workingBoard.ob(pixel) || !(this.workingBoard.board[pixel.y][pixel.x] === 0)
    }
    #getDangerArray(dangerFunction){
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.snakePixels)
        const head = this.snakePixels[0]
        //L
        let boardPointer = new Pixel(this.snakePixels[0].x, this.snakePixels[0].y - 1, 0)
        while(!dangerFunction(boardPointer)){
            boardPointer.y --
        }
        const dangerDistanceLeft = Math.max(0, head.y - boardPointer.y)
        //S
        boardPointer = new Pixel(this.snakePixels[0].x + 1, this.snakePixels[0].y, 0)
        while(!dangerFunction(boardPointer)){
            boardPointer.x ++
        }
        const dangerDistanceStraight = Math.max(0, boardPointer.x - head.x)
        //L
        boardPointer = new Pixel(this.snakePixels[0].x, this.snakePixels[0].y + 1, 0)
        while(!dangerFunction(boardPointer)){
            boardPointer.y ++
        }
        const dangerDistanceRight = Math.max(0, boardPointer.y - head.y)
        //B
        boardPointer = new Pixel(this.snakePixels[0].x - 1, this.snakePixels[0].y, 0)
        while(!dangerFunction(boardPointer)){
            boardPointer.x --
        }
        const dangerDistanceBehind = Math.max(0, head.x - boardPointer.x)
        const dangerDistArray = [dangerDistanceLeft, dangerDistanceStraight, dangerDistanceRight, dangerDistanceBehind]
        for(let i=0; i<this.direction; i++){
            dangerDistArray.push(dangerDistArray.shift())
        }
        const leftDistance = dangerDistArray[0]
        const straightDistance = dangerDistArray[1]
        const rightDistance = dangerDistArray[2]
        console.debug([leftDistance, straightDistance, rightDistance])
        return [leftDistance, straightDistance, rightDistance]
    }
    #getWallDistanceArray(){
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.snakePixels)
        const head = this.snakePixels[0]
        //L
        let boardPointer = new Pixel(this.snakePixels[0].x, this.snakePixels[0].y - 1, 0)
        while(!this.workingBoard.ob(boardPointer)){
            boardPointer.y --
        }
        const dangerDistanceLeft = Math.max(0, head.y - boardPointer.y)
        //S
        boardPointer = new Pixel(this.snakePixels[0].x + 1, this.snakePixels[0].y, 0)
        while(!this.workingBoard.ob(boardPointer)){
            boardPointer.x ++
        }
        const dangerDistanceStraight = Math.max(0, boardPointer.x - head.x)
        //L
        boardPointer = new Pixel(this.snakePixels[0].x, this.snakePixels[0].y + 1, 0)
        while(!this.workingBoard.ob(boardPointer)){
            boardPointer.y ++
        }
        const dangerDistanceRight = Math.max(0, boardPointer.y - head.y)
        //B
        boardPointer = new Pixel(this.snakePixels[0].x - 1, this.snakePixels[0].y, 0)
        while(!this.workingBoard.ob(boardPointer)){
            boardPointer.x --
        }
        const dangerDistanceBehind = Math.max(0, head.x - boardPointer.x)
        const dangerDistArray = [dangerDistanceLeft, dangerDistanceStraight, dangerDistanceRight, dangerDistanceBehind]
        for(let i=0; i<this.direction; i++){
            dangerDistArray.push(dangerDistArray.shift())
        }
        const leftDistance = dangerDistArray[0]
        const straightDistance = dangerDistArray[1]
        const rightDistance = dangerDistArray[2]
        return [leftDistance, straightDistance, rightDistance]
    }
    #getFoodDistanceArray(){
        const head = this.snakePixels[0]
        const foodDistanceArray = [Math.max(0, head.y - this.food?.y),
                                    Math.max(0, this.food?.x - head.x),
                                    Math.max(0, this.food?.y - head.y),
                                    Math.max(0, head.x - this.food?.x),
        ]
        for(let i=0; i<this.direction; i++){
            foodDistanceArray.push(foodDistanceArray.shift())
        }
        return foodDistanceArray
    }
    #getRelativeTailDirection(){
        let direction = 2
        if(this.snakePixels.length > 1){
            const tailNext = this.snakePixels[this.snakePixels.length-2]
            const tail = this.snakePixels[this.snakePixels.length-1]
            direction = tail.x > tailNext.x ? 0 :
                        tail.y > tailNext.y ? 1 :
                        tail.x < tailNext.x ? 2 :
                        tail.y < tailNext.y ? 3 :
                        2
        }
        return (((direction - this.direction) % 4) + 4) % 4
    }
}
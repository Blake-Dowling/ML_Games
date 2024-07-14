import { Board, Pixel } from '../Engine/Objects.js'
import seedrandom from 'seedrandom'
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

        this.modelParams = ['snake-model', 11, 3] //7
        this.initGame()
    }
    initGame(){
        this.score = 0
        this.rng = seedrandom(2)
        this.clearGame()

    }
    clearGame(){
        this.snakePixels = this.#newPlayer()
        this.turns = [0]
        this.#newFood()
        this.workingBoard = new Board(this.WIDTH, this.HEIGHT, [...this.snakePixels, this.food])
        this.ticksSinceAte = 0
    }
    getWorkingBoard(){
        return new Board(this.WIDTH, this.HEIGHT, [...this.snakePixels, this.food])
    }
    // ****************** Spawns new block ******************
    #newPlayer(){
        // return [new Pixel(Math.floor(Math.random()*this.WIDTH), Math.floor(Math.random()*this.HEIGHT), 3)]
        this.direction = 0
        return [new Pixel(parseInt(this.WIDTH/2), parseInt(this.HEIGHT/2), 3)]
    }
    #newFood(){
        let foodOnSnake = true
        while(foodOnSnake){
            this.food = new Pixel(Math.floor(this.rng()*this.WIDTH), Math.floor(this.rng()*this.HEIGHT), 1)
            // this.food = new Pixel(Math.floor(Math.random()*this.WIDTH), Math.floor(Math.random()*this.HEIGHT), 1)
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
        this.turns.unshift(parseInt(action) - 1)

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
            this.turns.pop()
        }
    }
    getState(){

        // const wallDistanceArray = this.#getWallDistanceArray()
        // const selfDistanceArray = this.#getSelfDistanceArray()
        const wallDistanceArray = this.#getDangerArray(this.#pixelOnSnake.bind(this))
        const selfDistanceArray = this.#getDangerArray(this.workingBoard?.ob.bind(this.workingBoard))
        const foodDistanceArray = this.#getPixelDistanceArray(this.food)
        const tailDistanceArray = this.#getPixelDistanceArray(this.snakePixels[this.snakePixels.length-1])
        const relativeTailDirection = this.#getRelativeTailDirection()
        const bend = this.#getBend()
        // console.debug(bend)
        // console.debug(this.snakePixels)
        // console.debug(this.direction, this.snakePixels[0], this.snakePixels[this.snakePixels.length-1])
        // console.debug(relativeTailDirection)
        // return [this.snakePixels.length].concat(tailDistanceArray).concat([relativeTailDirection]).concat(wallDistanceArray).concat(selfDistanceArray).concat(foodDistanceArray)
        return [bend].concat(wallDistanceArray).concat(selfDistanceArray).concat(foodDistanceArray) //7
        // this.workingBoard = new Board(this.WIDTH, this.HEIGHT, [...this.snakePixels, this.food])
        // console.debug(this.workingBoard?.board?.flat())
        // return [this.direction].concat(this.workingBoard?.board?.flat()) //8
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
    #getDistanceDirection(dangerFunction, direction){
        const boardPointer = new Pixel(this.snakePixels[0].x, this.snakePixels[0].y - 1, 0)
        let distance = 0
        while(!dangerFunction(boardPointer)){
            distance ++
            switch(direction){
                case 'B':
                    boardPointer.x --
                    break
                case 'LB':
                    boardPointer.x --
                    boardPointer.y --
                    break
                case 'L':
                    boardPointer.y --
                    break
                case 'LF':
                    boardPointer.x ++
                    boardPointer.y --
                    break
                case 'F':
                    boardPointer.x ++
                    break
                case 'RF':
                    boardPointer.x ++
                    boardPointer.y ++
                    break
                case 'R':
                    boardPointer.y ++
                    break
                case 'RB':
                    boardPointer.x --
                    boardPointer.y ++
                    break
            }
        }
        return distance
    }
    #getDangerArray(dangerFunction){
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.snakePixels)

        const behind = this.#getDistanceDirection(dangerFunction.bind(this), 'B')
        // const leftBehind = this.#getDistanceDirection(dangerFunction.bind(this), 'LB')
        const left = this.#getDistanceDirection(dangerFunction.bind(this), 'L')
        // const leftForward = this.#getDistanceDirection(dangerFunction.bind(this), 'LF')
        const forward = this.#getDistanceDirection(dangerFunction.bind(this), 'F')
        // const rightForward = this.#getDistanceDirection(dangerFunction.bind(this), 'RF')
        const right = this.#getDistanceDirection(dangerFunction.bind(this), 'R')
        // const rightBehind = this.#getDistanceDirection(dangerFunction.bind(this), 'RB')


        // const distanceArray = [behind, leftBehind, left, leftForward, forward, rightForward, right, rightBehind]
        const distanceArray = [behind, left, forward, right]
        for(let i=0; i<this.direction; i++){
            distanceArray.push(distanceArray.shift())
            // distanceArray.push(distanceArray.shift())
        }
        // const 
        // return [distanceArray[1], distanceArray[2], distanceArray[3], distanceArray[4], distanceArray[5], distanceArray[6], distanceArray[7]]
        return [distanceArray[1], distanceArray[2], distanceArray[3]]
    }

    #getPixelDistanceArray(pixel){
        const head = this.snakePixels[0]
        const distanceArray = [Math.max(0, head.y - pixel?.y),
                                    Math.max(0, pixel?.x - head.x),
                                    Math.max(0, pixel?.y - head.y),
                                    Math.max(0, head.x - pixel?.x),
        ]
        for(let i=0; i<this.direction; i++){
            distanceArray.push(distanceArray.shift())
        }
        return distanceArray
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
    #getBend(){
        let bend = 0
        for(let i=0; i<this.turns.length; i++){
            bend += this.turns[i]
        }
        return bend
    }
}
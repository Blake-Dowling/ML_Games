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

        this.modelParams = [7, 3, 'snake-model']
        this.initGame()
    }
    initGame(){
        this.snakePixels = this.#newPlayer()
        this.food = new Pixel(Math.floor(Math.random()*this.WIDTH), Math.floor(Math.random()*this.HEIGHT), 1)
        this.workingBoard = new Board(this.WIDTH, this.HEIGHT, [...this.snakePixels, this.food])
        this.score = 0
        this.ticksSinceAte = 0
    }
    // ****************** Spawns new block ******************
    #newPlayer(){
        return [new Pixel(Math.floor(Math.random()*this.WIDTH), Math.floor(Math.random()*this.HEIGHT), 3)]
    }
    #movePlayer(action){
        // actions: 0 left, 1 straight, 2 right
        this.direction = (((this.direction + (parseInt(action) - 1)) % 4) + 4) % 4
        const newHead = new Pixel(this.snakePixels[0].x, this.snakePixels[0].y, this.snakePixels[0].val)
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

        // let newSnakePixels = []
        // for(let i=0; i<this.snakePixels.length; i++){
        //     newSnakePixels.push(new Pixel(this.snakePixels[i].x, this.snakePixels[i].y, this.snakePixels[i].val))
        // }
        // this.snakePixels = newSnakePixels

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
        return this.ticksSinceAte > (this.workingBoard?.width * this.workingBoard?.height)
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
        else{
            this.snakePixels.pop()
        }
    }
    getState(){

        const dangerArray = this.#getDangerArray()
        const foodDirectionArray = this.#getFoodDirectionArray()

        return dangerArray.concat(foodDirectionArray)

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
    #getDangerArray(){
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.snakePixels)
        const pixelsSurroundingHead = [new Pixel(this.snakePixels[0].x,this.snakePixels[0].y - 1, 0), //L 
                                        new Pixel(this.snakePixels[0].x + 1,this.snakePixels[0].y, 0), //S   //L
                                        new Pixel(this.snakePixels[0].x,this.snakePixels[0].y + 1, 0), //R  //S
                                        new Pixel(this.snakePixels[0].x - 1,this.snakePixels[0].y, 0)      //R

        ]
        for(let i=0; i<this.direction; i++){
            pixelsSurroundingHead.push(pixelsSurroundingHead.shift())
        }
        const leftPixel = pixelsSurroundingHead[0]
        const straightPixel = pixelsSurroundingHead[1]
        const rightPixel = pixelsSurroundingHead[2]
        let snakeLeft = false
        let snakeStraight = false
        let snakeRight = false
        for(let i=0; i<this.snakePixels.length; i++)
        {
            if(leftPixel.colliding(this.snakePixels[i])){
                snakeLeft = true
            }
            if(straightPixel.colliding(this.snakePixels[i])){
                snakeStraight = true
            }
            if(rightPixel.colliding(this.snakePixels[i])){
                snakeRight = true
            }
        }
        const dangerLeft = Number(this.workingBoard.ob(leftPixel) || snakeLeft)
        const dangerStraight = Number(this.workingBoard.ob(straightPixel) || snakeStraight)
        const dangerRight = Number(this.workingBoard.ob(rightPixel) || snakeRight)
        return [dangerLeft, dangerStraight, dangerRight]
    }
    #getFoodDirectionArray(){
        const head = this.snakePixels[0]
        const foodDirectionArray = [Math.max(0, head.y - this.food?.y),
                                    Math.max(0, this.food?.x - head.x),
                                    Math.max(0, this.food?.y - head.y),
                                    Math.max(0, head.x - this.food?.x),
        ]
        for(let i=0; i<this.direction; i++){
            foodDirectionArray.push(foodDirectionArray.shift())
        }
        return foodDirectionArray
    }
}
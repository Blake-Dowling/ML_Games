import { Board, Pixel } from '../Engine/Objects.js'


export class Snake {
    constructor(){
        this.WIDTH = 10
        this.HEIGHT = 10
        this.direction = 0
        this.snakePixels = []
        this.food = undefined
        this.grow = false
        this.ticksSinceAte = 0
        this.workingBoard = undefined

        this.score = 0
        this.reward = 0
        this.done = false
        this.state = null
        this.newState = true

        this.modelParams = [9, 3, 'snake-model-2']
        this.initGame()
    }
    initGame(){
        this.snakePixels = this.#newPlayer()
        this.food = new Pixel(Math.floor(Math.random()*this.WIDTH), Math.floor(Math.random()*this.HEIGHT), 1)
        this.workingBoard = new Board(this.WIDTH, this.HEIGHT, [...this.snakePixels, this.food])
        this.score = 0
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
        if(!this.grow){
            this.snakePixels.pop()
        }
        else{
            this.grow = false
        }

        // let newSnakePixels = []
        // for(let i=0; i<this.snakePixels.length; i++){
        //     newSnakePixels.push(new Pixel(this.snakePixels[i].x, this.snakePixels[i].y, this.snakePixels[i].val))
        // }
        // this.snakePixels = newSnakePixels

    }
    #checkCollision(){
        const ob = this.workingBoard.ob(this.snakePixels[0])
        let selfCollision = false
        for(let i=1; i<this.snakePixels.length; i++){
            if(this.snakePixels[i].colliding(this.snakePixels[0])){
                selfCollision = true
            }
        }
        const collision = Number(ob || selfCollision)
        if(collision){
            this.initGame()
        }
        return collision
    }
    #checkTimeout(){
        let timeout = this.ticksSinceAte > (this.workingBoard?.width * this.workingBoard?.height) / 3
        if(timeout){
            this.ticksSinceAte = 0
            this.initGame()
        }
        return Number(timeout)
    }
    #checkAte(){
        const ate = this.snakePixels[0]?.colliding(this.food)
        if(ate){
            this.grow = true
            this.food = new Pixel(Math.floor(Math.random()*this.WIDTH), Math.floor(Math.random()*this.HEIGHT), 1)
            this.ticksSinceAte = 0
            // this.score += 10
        }
        this.workingBoard = new Board(this.WIDTH, this.HEIGHT, this.snakePixels)
        return Number(ate)
    }
    getState(action){
        //Action
        //Player movement
        this.#movePlayer(action)
        this.ticksSinceAte += 1
        const timeout = this.#checkTimeout()
        //Player movement result
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.snakePixels)
        const ate = this.#checkAte()

        // //New board result
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.snakePixels)

        const collision = this.#checkCollision()
        // //Remove player from board after init for following calculations
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.snakePixels)
        // //New state
        const dangerArray = this.#getDangerArray()
        const foodDirectionArray = this.#getFoodDirectionArray()
        //Reward
        this.reward = 0
        this.reward += ate * 10
        this.score += (10 * ate)
        this.reward -= 5 * (collision + timeout)
        //Done
        this.done = Number(collision || timeout)
        //State
        this.state = [this.direction].concat([this.snakePixels.length]).concat(dangerArray).concat(foodDirectionArray)
        // console.debug(foodDirectionArray)

        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, [...this.snakePixels, this.food])

        return this
    }
    #getDangerArray(){
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
        const foodDirectionArray = [Number(this.food?.y < head.y),
                                    Number(this.food?.x > head.x),
                                    Number(this.food?.y > head.y),
                                    Number(this.food?.x < head.x),
        ]
        for(let i=0; i<this.direction; i++){
            foodDirectionArray.push(foodDirectionArray.shift())
        }
        return foodDirectionArray
    }
}
import { Board, Pixel } from '../Engine/Objects.js'


export class Snake {
    constructor(){
        this.WIDTH = 10
        this.HEIGHT = 10
        this.direction = 0
        this.snakePixels = []
        this.food = undefined
        this.grow = false
        this.ate = false

        this.ticksSinceAte = 0
        this.collisionOrTimeout = 0
        this.workingBoard = undefined

        this.score = 0
        this.action = 0
        this.reward = 0
        this.done = false
        this.state = null
        this.newState = true

        this.modelParams = [7, 3, 'snake-model-2']
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
    #movePlayer(){

        // actions: 0 left, 1 straight, 2 right
        this.direction = (((this.direction + (parseInt(this.action) - 1)) % 4) + 4) % 4
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
        if(ob || selfCollision){
            this.collisionOrTimeout = Number(ob || selfCollision)
        }
    }
    #checkTimeout(){
        this.collisionOrTimeout = Number(this.ticksSinceAte > (this.workingBoard?.width * this.workingBoard?.height))
    }
    #enforceCollisionOrTimeout(){
        if(this.collisionOrTimeout){
            this.ticksSinceAte = 0
            this.initGame()
            this.collisionOrTimeout = 0
        }
    }
    #checkAte(){
        this.ate = Number(this.snakePixels[0]?.colliding(this.food))

    }
    #enforceAte(){
        if(this.ate){
            this.grow = true
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
            this.ate = 0
        }
    }
    getState(){
        //Action
        //Player movement
        this.#checkAte()
        this.ticksSinceAte += 1
        this.#checkTimeout()
        //Player movement result


        // //New board result

        this.#checkCollision()

        // //Remove player from board after init for following calculations
        const dangerArray = this.#getDangerArray()
        const foodDirectionArray = this.#getFoodDirectionArray()
        // const prevState = this.state
        //State
        this.state = dangerArray.concat(foodDirectionArray)
        // //New state
        // if(this.state !== prevState){

            //Reward
            // console.debug(dangerArray)
            this.score += (10 * this.ate)
            this.reward = 0
            this.reward += this.ate * 10//(this.score**2)
            this.reward -= 10 * (this.collisionOrTimeout)
            //Done
            // console.debug(collision || timeout)
            this.done = Boolean(this.collisionOrTimeout)

            // this.state = [this.direction].concat([this.snakePixels.length]).concat(dangerArray).concat(foodDirectionArray)

            // console.debug(foodDirectionArray)
            // this.newState = true
        // }else{
            // this.newState = false
        // }
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, [...this.snakePixels, this.food])

    }
    move(){
        this.#enforceAte()
        if(this.collisionOrTimeout){
            this.#enforceCollisionOrTimeout()
        }
        else{
            this.#movePlayer()
        }
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, [...this.snakePixels, this.food])
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
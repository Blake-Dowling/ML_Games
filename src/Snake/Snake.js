import { Board, Piece } from '../Engine/Objects.js'


export class Snake {
    constructor(){
        this.WIDTH = 10
        this.HEIGHT = 10
        this.direction = 0
        this.snakePixels = []
        this.food = undefined
        this.workingBoard = undefined
        // this.score = 0
        // this.reward = 0
        // this.done = false
        // this.state = null
        this.newState = true

        // this.modelParams = [this.WIDTH+3, 3, 'snake-model']
        this.initGame()
    }
    initGame(){
        this.snakePixels = this.#newPlayer()
        this.food 
        this.workingBoard = new Board(this.WIDTH, this.HEIGHT, [...this.snakePixels, this.food])
        this.score = 0
    }
    // ****************** Spawns new block ******************
    #newPlayer(){
        return [new Pixel(Math.random()*this.WIDTH, Math.random()*this.HEIGHT, 1)]
    }
    #movePlayer(action){
        // actions: 0 left, 1 straight, 2 right
        this.direction = this.direction + (parseInt(action) - 1)
        const newHead = this.snakePixels[0]
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
        this.snakePixels.pop()
    }
    #checkOb(){
        const ob = this.workingBoard.ob(this.snakePixels[0])
        if(ob){
            this.initGame()
        }
        return ob
    }
    #checkAte(){
        const ate = this.snakePixels[0]?.colliding(this.food)
        if(ate){

        }
        this.workingBoard = new Board(this.WIDTH, this.HEIGHT, [this.snakePixels])
    }
    getState(action){
        //Action
        //Player movement
        this.#movePlayer(action)
        //Player movement result
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.snakePixels)
        const ate = this.#checkAte()
        // //New board result
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.snakePixels)
        const ob = this.#checkOb()
        // //Remove player from board after init for following calculations
        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, this.snakePixels)
        // //New state
        const dangerArray = this.#getDangerArray()
        const foodDirectionArray = this.#getFoodDirectionArray()
        //Reward
        this.reward = 0
        this.reward += (this.WIDTH) * (numCompleteRows**2) + 1
        this.score += (10 * numCompleteRows)
        this.reward -= 5 * fullColumn
        //Done
        this.done = fullColumn!==0
        //State
        this.state = [this.direction].concat([this.snakePixels.length]).concat(numHoles).concat(bumpiness)


        this.workingBoard = new Board(this.workingBoard.width, this.workingBoard.height, [this.player, ...this.restingPixels])

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
        const dangerLeft = parseInt(this.workingBoard.ob(leftPixel) || snakeLeft)
        const dangerStraight = parseInt(this.workingBoard.ob(straightPixel) || snakeStraight)
        const dangerRight = parseInt(this.workingBoard.ob(rightPixel) || snakeRight)
        return [dangerLeft, dangerStraight, dangerRight]
    }
    #getFoodDirectionArray(){
        const head = this.snakeArray[0]
        const foodDirectionArray = [parseInt(this.food?.y < head.y),
                                    parseInt(this.food?.x > head.x),
                                    parseInt(this.food?.y > head.y),
                                    parseInt(this.food?.x < head.x),
        ]
        for(let i=0; i<this.direction; i++){
            foodDirectionArray.push(foodDirectionArray.shift())
        }
        return foodDirectionArray
    }
}
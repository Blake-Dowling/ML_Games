export class Pixel{
    constructor(x, y, val){
        this.x = x
        this.y = y
        this.val = val
    }
    colliding(otherPixel){
        return this.x === otherPixel.x && this.y === otherPixel.y
    }
}

export class Board{
    constructor(width, height, pixels){
        this.width = width
        this.height = height
        this.pixels = pixels
        this.refresh()
        this.draw()
    }
    refresh(){
        const rows = []
        for(let r=0; r<this.height; r++){
            const row = []
            for(let c=0; c<this.width; c++){
                row.push(0)
            }
            rows.push(row)
        }
        this.board = rows
    }
    ob(pixel){
        return pixel.x < 0 || pixel.x >= this.width || pixel.y < 0 || pixel.y >= this.height
    }
    //Todo: multicell object
    draw(){
        this.refresh()
        // console.debug(this.pixels)
        for(let j=0; j<this.pixels.length; j++){
            const pixel = this.pixels[j]
            // if(this.board && this.board[pixel.y] && this.board[pixel.y][pixel.x] && !this.ob(pixel)){

            if(this.board && !this.ob(pixel)){
                // console.debug(this.board)

                this.board[pixel.y][pixel.x] = pixel.val
            }
        }
        
    }
    grounded(pixels){
        for(let i=0; i<pixels?.length; i++){
            const pixel = pixels[i]
            const below = new Pixel(pixel?.x, pixel?.y+1, null)
            if(this.ob(below)){
                return true
            }
            else if(this.board[below.y][below.x] > 0){
                return true
            }
        }
        return false
    }
}
// ****************** TetrisBlock Class ******************
export class TetrisBlock{
    constructor(x, y, orientation, type, val){
        //Todo: boundary check function, use board
        const WIDTH = 6
        this.init(x, y, orientation, type, val)
        let minX = 0
        let maxX = 0
        for(let i=0; i<this.pixels.length; i++){
            minX = Math.min(this.pixels[i].x - 0, minX)
            maxX = Math.min((WIDTH-1) - this.pixels[i].x, maxX)
        }
        this.init(x - minX + maxX, y, orientation, type, val)
    }
    init(x, y, orientation, type, val){
        this.x = x
        this.y = y
        this.orientation = orientation
        this.type = type
        this.val = val
        this.pixels = []
        //  Initialize shape
        switch(this.type){
            //Square
            case 0:
                this.orientation = 0
                this.pixels.push(new Pixel(x, y, 3))
                this.pixels.push(new Pixel(x+1, y, 3))
                this.pixels.push(new Pixel(x, y+1, 3))
                this.pixels.push(new Pixel(x+1, y+1, 3))
                break
            //Line
            case 1:
                // this.blocks.push([x-1, y])
                this.orientation = this.orientation % 2
                this.pixels.push(new Pixel(x, y, 3))
                this.pixels.push(new Pixel(x+1, y, 3))
                this.pixels.push(new Pixel(x+2, y, 3))
                this.pixels.push(new Pixel(x+3, y, 3))
                break
            //ZigZag
            case 2:
                this.orientation = this.orientation % 2
                this.pixels.push(new Pixel(x-1, y, 3))
                this.pixels.push(new Pixel(x, y, 3))
                this.pixels.push(new Pixel(x, y+1, 3))
                this.pixels.push(new Pixel(x+1, y+1, 3))
                break
            //L
            case 3:
                this.pixels.push(new Pixel(x-1, y, 3))
                this.pixels.push(new Pixel(x, y, 3))
                this.pixels.push(new Pixel(x-1, y+1, 3))
                this.pixels.push(new Pixel(x+1, y, 3))
                break
            //T
            case 4:
                this.pixels.push(new Pixel(x-1, y, 3))
                this.pixels.push(new Pixel(x, y, 3))
                this.pixels.push(new Pixel(x+1, y, 3))
                this.pixels.push(new Pixel(x, y+1, 3))
                break
        }
        // Orient blocks
        for(let i=0; i<this.pixels.length; i++){
            let pixelX = this.pixels[i].x
            let pixelY = this.pixels[i].y
            for(let j=0; j<this.orientation; j++){
                const xDiff = pixelX - x
                const yDiff = pixelY - y
                const newXDiff = yDiff * -1
                const newYDiff = xDiff
                pixelX = newXDiff + x
                pixelY = newYDiff + y
            }
            this.pixels[i].x = pixelX
            this.pixels[i].y = pixelY
        }
        // this.pixels = this.pixels?.map(prevBlock => {
        //     let newBlock = JSON.parse(JSON.stringify(prevBlock))
        //     for(let i=0; i<this.orientation; i++){
        //         const xDiff = newBlock[0] - x
        //         const yDiff = newBlock[1] - y
        //         const newXDiff = yDiff * -1
        //         const newYDiff = xDiff
        //         newBlock = [x + newXDiff, y + newYDiff]
        //     }
        //     return newBlock
        // })
    }
}

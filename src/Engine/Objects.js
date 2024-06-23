class Pixel{
    constructor(x, y, val){
        this.x = x
        this.y = y
        this.val = val
    }
    colliding(otherPixel){
        return this.x === otherPixel.x && this.y === otherPixel.y
    }
}
export class Piece{
    constructor(x, y, val){
        this.x = x
        this.y = y
        this.val = val 
        this.init()
    }
    init(){
        this.pixels = [new Pixel(this.x, this.y, this.val)]
    }
    move(xDist, yDist){
        this.x = this.x+xDist
        this.y = this.y+yDist
        this.init()
    }
    colliding(piece){
        for(let i=0; i<this.pixels.length; i++){
            const pixelA = this.pixels[i]
            for(let j=0; j<piece.pixels.length; j++){
                const pixelB = piece.pixels[j]
                if(pixelA.x == pixelB.x && pixelA.y == pixelB.y){
                    return true
                }
            }
        }
        return false
    }

    dist(otherPiece){
        return Math.abs(this.x - otherPiece.x)
    }


}
export class Board{
    constructor(width, height, pieces){
        this.width = width
        this.height = height
        this.pieces = JSON.parse(JSON.stringify(pieces))
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
        for(let i=0; i<this.pieces.length; i++){
            const pixels = this.pieces[i].pixels
            for(let j=0; j<pixels.length; j++){
                const pixel = pixels[j]
                if(!this.ob(pixel)){
                    this.board[pixel.y][pixel.x] = pixel.val
                }
            }
        }
    }
    grounded(piece){
        for(let i=0; i<piece?.pixels?.length; i++){
            const pixel = piece?.pixels[i]
            const below = new Pixel(pixel?.x, pixel?.y+1, null)
            if(this.ob(below)){
                return true
            }
            else if(this.board[below.y][below.x] == 1){
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

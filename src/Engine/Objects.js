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
class Piece{
    constructor(x, y){
        this.id = Math.floor(Math.random()*1000000)
        this.x = x
        this.y = y
        this.pixels = []
    }
    move(x, y){
        this.x += x
        this.y += y
        for(let i=0; i<this.pixels.length; i++){
            this.pixels[i].x += x
            this.pixels[i].y += y
        }
    }
    overLapping(otherPiece){
        for(let i=0; i<this.pixels.length; i++){
            const thisPixel = this.pixels[i]
            for(let j=0; j<otherPiece.pixels.length; j++){
                const otherPixel = otherPiece.pixels[j]
                if(thisPixel.x == otherPixel.x && thisPixel.y == otherPixel.y){
                    return true
                }
            }
        }
        return false
    }
    onTopOf(otherPiece){
        let lowestY = Number.MIN_SAFE_INTEGER
        for(let i=0; i<this.pixels.length; i++){
            lowestY = Math.max(lowestY, this.pixels[i].y)
        }
        for(let i=0; i<this.pixels.length; i++){
            const thisPixel = this.pixels[i]
            for(let j=0; j<otherPiece.pixels.length; j++){
                const otherPixel = otherPiece.pixels[j]
                if(thisPixel.y == lowestY && otherPixel.x == thisPixel.x && otherPixel.y == thisPixel.y+1){
                    return true
                }
            }
        }
        return false
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
    update(){
        const newPixels = []
        for(let r=0; r<this.height; r++){
            for(let c=0; c<this.width; c++){
                newPixels.push(new Pixel(c, r, this.board[r][c]))
            }
        }
        this.pixels = newPixels
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
    collisionPixel(pixel){
        for(let i=0; i<this.pixels.length; i++){
            const boardPixel = this.pixels[i]
            if(boardPixel.x == pixel.x && boardPixel.y == pixel.y){
                return true
            }
        }
        return false
    }
    collision(piece){
        for(let i=0; i<this.pixels.length; i++){
            const boardPixel = this.pixels[i]
            for(let j=0; j<piece.pixels.length; j++){
                const piecePixel = piece.pixels[j]
                if(boardPixel.x == piecePixel.x && boardPixel.y == piecePixel.y){
                    return true
                }
            }
        }
        return false
    }
    getPixels(){
        const pixels = []
        for(let i=0; i<this.board.length; i++){
            for(let j=0; j<this.board[i].length; j++){
                if(this.board[i][j] > 0){
                    pixels.push(new Pixel(j, i, this.board[i][j]))
                }

            }
        }
        return pixels
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

export class MarioPlayer extends Piece{
    constructor(x, y){
        super(x, y)
        this.val = 3
        this.init()
    }
    init(x, y){
        this.pixels = [
            new Pixel(this.x, this.y, this.val),
            new Pixel(this.x, this.y-1, this.val),
        ]
    }

}

export class MarioPlatform extends Piece{
    constructor(x, y, length){
        super(x, y)
        this.val = 1
        this.length = length
        this.init()
    }
    init(){
        this.pixels = []
        for(let i=0; i<this.length; i++){
            this.pixels.push(new Pixel(this.x+i, this.y, this.val))
        }
    }

}
export class MarioPipe extends Piece{
    constructor(x, y, height){
        super(x, y)
        this.val = 1
        this.height = height
        this.init()
    }
    init(){
        this.pixels = []
        for(let i=0; i<this.height; i++){
            this.pixels.push(new Pixel(this.x, this.y-i, this.val))
        }
    }

}
export class MarioBoard extends Board{
    constructor(width, height, pixels){
        super(width, height, pixels)
    }
    grounded(piece){

        // const pixels = piece.pixels
        const boardPixels = new Piece(null, null)
        boardPixels.pixels = this.pixels
        return piece.onTopOf(boardPixels)
        // for(let i=0; i<pixels?.length; i++){
        //     const pixel = pixels[i]
        //     for(let j=0; j<this.pixels.length; j++){
        //         const boardPixel = this.pixels[j]
        //         if(boardPixel.x == pixel.x && boardPixel.y == pixel.y+1){
        //             return true
        //         }
        //     }
        // }
        // return false
    }
    pieceOB(piece){
        const pixels = piece.pixels

        for(let i=0; i<pixels?.length; i++){
            if(this.ob(pixels[i])){
                return true
            }
        }
        return false
    }
    pieceFallen(piece){
        const pixels = piece.pixels

        for(let i=0; i<pixels?.length; i++){
            if(pixels[i].y >= this.height){
                return true
            }
        }
        return false
    }

}

class Pixel{
    constructor(x, y, val){
        this.x = x
        this.y = y
        this.val = val
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
    constructor(width, height){
        this.width = width
        this.height = height
        this.refresh()
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
    draw(pieces){
        this.refresh()
        for(let i=0; i<pieces.length; i++){
            const pixels = pieces[i].pixels
            for(let j=0; j<pixels.length; j++){
                const pixel = pixels[j]
                if(!this.ob(pixel)){
                    this.board[pixel.y][pixel.x] = pixel.val
                }
            }
        }
    }
    grounded(piece){
        for(let i=0; i<piece.pixels.length; i++){
            const pixel = piece.pixels[i]
            const below = new Pixel(pixel.x, pixel.y+1, null)
            if(this.ob(below)){
                return true
            }
            if(this.board[below.y][below.x] > 0){
                return true
            }
            return false
        }
    }

}
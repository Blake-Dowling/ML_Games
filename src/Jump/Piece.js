export default class Piece{
    constructor(x, y, val){
        this.x = x
        this.y = y
        this.val = val
    }

    dist(otherPiece){
        return Math.abs(this.x - otherPiece.x)
    }
    collidedWithPiece(otherPiece){
        return (this.x === otherPiece.x && 
            this.y === otherPiece.y)
    }

}
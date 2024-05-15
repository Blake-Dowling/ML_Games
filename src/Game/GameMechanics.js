import React, {useState, useEffect} from 'react'
import Piece from './Piece'

// Note: When changing class instances in setState, 
// Do not copy using JSON.parse, as this will create
// a JSON object instead of a new class instance.
// This is okay for lists of class instances, though.

export function spawnRockRandom(setRocks){
    if(Math.floor(Math.random()*2) == 0){
        setRocks(prevRocks => {
          const newRocks = JSON.parse(JSON.stringify(prevRocks))
          newRocks.push(new Piece(3, 4, 1))
          return newRocks
        })
      }
}
export function moveAllRocks(setRocks){
    setRocks(prevRocks => {
        const newRocks = []
        for(let i=0; i<prevRocks.length; i++){
          const newRock = JSON.parse(JSON.stringify(prevRocks[i]))
          newRock.x -= 1
          if(newRock.x >= 0){
            newRocks.push(newRock)
          }
        }
        return newRocks
      })
}
export function jump(piece, setPiece, HEIGHT){
    if(checkInAir(piece, HEIGHT)){
        return
    }
    setPiece(prevPiece => {
        const newPiece = new Piece(prevPiece.x, prevPiece.y-1, prevPiece.val)
        return newPiece
    })
}
export function gravity(setPiece, HEIGHT){
    setPiece(prevPiece => {
        let newY = prevPiece.y
        const moveAmount = 1
        if(newY + moveAmount < HEIGHT){
            newY += moveAmount
        }
        return new Piece(prevPiece.x, newY, prevPiece.val)
    })

}
//Todo: multi-cell
export function checkRockCollision(piece, rocks){
    for(let i=0; i<rocks.length; i++){
        if(piece.collidedWithPiece(rocks[i])){
            return true
        }
    }
    return false
}

export function checkInAir(piece, HEIGHT){
    return piece.y < (HEIGHT - 1)
}


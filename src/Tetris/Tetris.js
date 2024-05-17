import React, {useState, useEffect} from 'react'
import './Tetris.css'
import { Board, Piece, TetrisBlock } from '../Engine/Objects'

const WIDTH = 6
const HEIGHT = 10

let player = null
let restingPixels = []
let workingBoard = null

// ******************************************************
// ****************** Main Game Component ******************
// ******************************************************
export function Tetris(props) {
    function initGame(){
        player = newBlock()
        restingPixels = []
        workingBoard = new Board(WIDTH, HEIGHT, [player])
        props.setScore(0)
      }
    useEffect(() => {
        props.setModelParams([WIDTH+1, 4*WIDTH, 'tetris-model'])
        props.setWIDTH(WIDTH)
        props.setHEIGHT(HEIGHT)
        initGame()
    }, []) 

    // ****************** Spawns new block ******************
    function newBlock(){
        return new TetrisBlock(
            Math.floor(Math.random()*WIDTH), 
            0, 
            Math.floor(Math.random()*4),
            Math.floor(Math.random()*5),
            3
            )
    }


    function gravityPlayer(player, board){
        if(!board?.grounded(player)){
              player.y += 1
        }
        return new TetrisBlock(player.x, player.y, player.orientation, player.type)
    }
    function movePlayer(player, board, action){
        player.orientation = parseInt(action / WIDTH)
        player.x = parseInt(action % WIDTH)
        return new TetrisBlock(player.x, player.y, player.orientation, player.type)
    }
    function updateBoard(){
        props.setBoard(prevBoard => {
            return new Board(prevBoard?.width, prevBoard?.height, [player, ...restingPixels])
        })
      }
    // ****************** Get board column heights ******************
    function getHeights(board){
        let heights = []
        for(let i=0; i<WIDTH; i++){
            heights.push(0)
        }
        if(board === null){
            return heights
        }
        for(let r=0; r<(board?.length); r++){
            for(let c=0; c<board[r].length; c++){
                if(board[r][c] === 1 && heights[c] === 0){
                    heights[c] = HEIGHT - r
                }
            }
        }
        return heights
    }
    function checkBlockStop(){
        if(workingBoard.grounded(player)){
            const newPieces = []
            for(let i=0; i<player.pixels.length; i++){
                newPieces.push(new Piece(player.pixels[i].x, player.pixels[i].y, 1))
            }
            restingPixels = restingPixels.concat(...newPieces)
            player = newBlock()
        }
        workingBoard = new Board(workingBoard.width, workingBoard.height, [player, ...restingPixels])
    }
    function checkCompleteRows(){
        let numCompleteRows = 0
        for(let i=workingBoard.board.length-1; i>=0; i--){
            let complete = true
            for(let j=0; j<workingBoard.board[i].length; j++){
                if(workingBoard.board[i][j].val !== 1){
                    complete = false
                    break
                }
            }
            if(complete){
                numCompleteRows ++
                workingBoard.board.splice(i, 1)
            }
        }
        restingPixels = []
        for(let i=workingBoard.board.length-1; i>=0; i--){
            for(let j=0; j<workingBoard.board[i].length; j++){
                if(workingBoard.board[i][j] > 0){
                    restingPixels.push(new Piece(j, i, workingBoard.board[i][j]))
                }
            }
        }
        return numCompleteRows
    }
    function checkFullColumn(){
        for(let i=0; i<workingBoard.board[0].length; i++){
            if(workingBoard.board[0][i] > 0){
                initGame()
                return 1
            }
        }
        return 0
    }
    function run(){
        //Action

        player = movePlayer(player, props.board, props.action)
        player = gravityPlayer(player, props.board)

        //State
        const state = [player.type].concat(getHeights(props.board.board))
        props.setState(state)
        // //Reward
        workingBoard = new Board(props.board.width, props.board.height, [player, ...restingPixels])

        checkBlockStop()

        workingBoard = new Board(props.board.width, props.board.height, restingPixels)
        const numCompleteRows = checkCompleteRows()

        const fullColumn = checkFullColumn()
        let reward = 0
        reward += 10 * numCompleteRows
        reward -= 20 * fullColumn
        props.setReward(reward)
        props.setDone(reward!==0)
        //Trigger state update, agent render
        updateBoard()
    }
    //Event loop
    useEffect(() => {
        if(player && props.board){
          run()
        }
      }, [props.ticks])
    // ****************** Arrow key event handler ******************
    // function keyPressCallback(key){
    //     switch(key){
    //         case 'ArrowRight':
    //             moveBlock('x', 1)
    //             break
    //         case 'ArrowDown':
    //             moveBlock('y', 1)
    //             break
    //         case 'ArrowLeft':
    //             moveBlock('x', -1)
    //             break
    //         case 'ArrowUp':
    //             rotateBlock()
    //             break
    //     }
    // }

    // ******************************************************** 
    // **************************** Render **************************** 
    // ******************************************************** 
  return (
    // **************************** Render Screen **************************** 
    <div className="main">


    </div>
  )
}

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
        props.setModelParams([WIDTH+3, 4*WIDTH, 'tetris-model-4'])
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
            return true
        }
        return false
    }
    function checkCompleteRows(){
        let numCompleteRows = 0
        for(let i=workingBoard.board.length-1; i>=0; i--){
            let complete = true
            for(let j=0; j<workingBoard.board[i].length; j++){
                if(workingBoard.board[i][j] !== 1){
                    complete = false
                    break
                }
            }
            if(complete){
                numCompleteRows ++
                workingBoard.board.splice(i, 1)
                const emptyRow = new Array(WIDTH).fill(0)
                workingBoard.board = [emptyRow, ...workingBoard.board]
                i ++
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
    function countHoles(board){
        let numHoles = 0
        for(let r=0; r<board.length-1; r++){
            for(let c=0; c<board[r].length; c++){
                if(board[r][c] > 0){
                    let depth = 1
                    while(r+depth < board.length && board[r+depth][c] === 0){
                        numHoles ++
                        depth ++
                    }
                }
            }
        }
        return numHoles
    }
    function getBumpiness(heights){
        let bumpiness = 0
        for(let c=1; c<heights.length; c++){
            bumpiness = bumpiness + Math.abs(heights[c] - heights[c-1])
        }
        return bumpiness
    }
    function getState(){
        //Action
        //Player movement
        player = movePlayer(player, props.board, props.action)
        player = gravityPlayer(player, props.board)
        //Player movement result
        workingBoard = new Board(props.board.width, props.board.height, [player, ...restingPixels])
        const blockStop = checkBlockStop()
        //New board result
        workingBoard = new Board(props.board.width, props.board.height, restingPixels)
        const numCompleteRows = checkCompleteRows()
        const fullColumn = checkFullColumn()
        //Remove player from board after init for following calculations
        workingBoard = new Board(props.board.width, props.board.height, restingPixels)
        //New state
        if(blockStop || numCompleteRows || fullColumn){
            // console.debug("blockStop:", blockStop)
            // console.debug("numCompleteRows:", numCompleteRows)
            // console.debug("fullColumn:", fullColumn)
            const heights = getHeights(workingBoard.board)
            const numHoles = countHoles(workingBoard.board)
            // console.debug("heights:", heights)
            // console.debug("numHoles:", numHoles)
            const bumpiness = getBumpiness(heights)
            //Reward
            let reward = 0
            reward += (WIDTH) * (numCompleteRows**2) + 1
            props.setScore(prevScore=>{return prevScore + (10 * numCompleteRows)})
            reward -= 5 * fullColumn
            props.setReward(reward)
            //Done
            props.setDone(fullColumn!==0)
            //Trigger state update, agent render
            //State
            const state = [player.type].concat(heights).concat(numHoles).concat(bumpiness)
            props.setState(state)
        }

        workingBoard = new Board(props.board.width, props.board.height, [player, ...restingPixels])
        props.setBoard(workingBoard)
    }
    //Event loop
    useEffect(() => {
        if(player && props.board){
            getState()
        }
      }, [props.ticks])
    useEffect(() => {
        if(player && props.board){
            getState()
        }
      }, [])

  return (
    // **************************** Render Screen **************************** 
    <div className="main">

    </div>
  )
}

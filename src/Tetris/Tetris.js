import React, {useState, useEffect} from 'react'
import './Tetris.css'
import axios from 'axios'
import Timer from './Timer'
import Board from './Board'
import KeyPress from './KeyPress'
import Agent from './Agent'

const CELL_SIZE = 50
const WIDTH = 6
const HEIGHT = 10

// ****************** Block Class ******************
class Block{
    constructor(x, y, orientation, type){
        this.init(x, y, orientation, type)
        let minX = 0
        let maxX = 0
        for(let i=0; i<this.blocks.length; i++){
            minX = Math.min(this.blocks[i][0] - 0, minX)
            maxX = Math.min((WIDTH-1) - this.blocks[i][0], maxX)
        }
        this.init(x - minX + maxX, y, orientation, type)
    }
    init(x, y, orientation, type){
        this.x = x
        this.y = y
        this.orientation = orientation
        this.type = type
        this.blocks = []
        //  Initialize shape
        switch(this.type){
            //Square
            case 0:
                this.orientation = 0
                this.blocks.push([x, y])
                this.blocks.push([x+1, y])
                this.blocks.push([x, y+1])
                this.blocks.push([x+1, y+1])
                break
            //Line
            case 1:
                // this.blocks.push([x-1, y])
                this.orientation = this.orientation % 2
                this.blocks.push([x, y])
                this.blocks.push([x+1, y])
                this.blocks.push([x+2, y])
                this.blocks.push([x+3, y])
                break
            //ZigZag
            case 2:
                this.orientation = this.orientation % 2
                this.blocks.push([x-1, y])
                this.blocks.push([x, y])
                this.blocks.push([x, y+1])
                this.blocks.push([x+1, y+1])
                break
            //L
            case 3:
                this.blocks.push([x-1, y])
                this.blocks.push([x, y])
                this.blocks.push([x-1, y+1])
                this.blocks.push([x+1, y])
                break
            //T
            case 4:
                this.blocks.push([x-1, y])
                this.blocks.push([x, y])
                this.blocks.push([x+1, y])
                this.blocks.push([x, y+1])
                break
        }
        // Orient blocks
        this.blocks = this.blocks?.map(prevBlock => {
            let newBlock = JSON.parse(JSON.stringify(prevBlock))
            for(let i=0; i<this.orientation; i++){
                const xDiff = newBlock[0] - x
                const yDiff = newBlock[1] - y
                const newXDiff = yDiff * -1
                const newYDiff = xDiff
                newBlock = [x + newXDiff, y + newYDiff]
            }
            return newBlock
        })
    }
}
// ******************************************************
// ****************** Main Game Component ******************
// ******************************************************
export function Tetris() {
    // ****************** Define model states ******************
    const [ticks, setTicks] = useState(0) //Tracks ticks
    const [boardOn, setBoardOn] = useState(true) //Switch for Board
    const [speed, setSpeed] = useState(2000) //Switch for Board
    
    const [squares, setSquares] = useState(null) //Board squares
    const [block, setBlock] = useState(new Block(0, 0, 0, 0)) //Active game piece
    
    useEffect(() => {newBlock()}, []) // Spawn block on init

    // ****************** Move block down each tick ******************
    useEffect(() => {setBlock(prevBlock=>{ return new Block(prevBlock.x, prevBlock.y+1, prevBlock.orientation, prevBlock.type)})}, [ticks])

    // ****************** Spawns new block ******************
    function newBlock(){
        setBlock(new Block(
            Math.floor(Math.random()*WIDTH), 
            0, 
            // 1,
            // 0,
            Math.floor(Math.random()*4),
            // 4))
            Math.floor(Math.random()*5)
            ))
    }

    // ****************** Moves block ******************
    function moveBlock(axis, amount){
        setBlock(prevBlock => {
            if(axis === 'x' && squares[prevBlock.y][(prevBlock.x) + amount] != 1){
                return new Block(Math.max(Math.min((prevBlock.x) + amount, WIDTH - 1), 0), prevBlock.y, prevBlock.orientation, prevBlock.type)
            }
            if(axis === 'y'){
                return new Block(prevBlock.x, Math.max(Math.min((prevBlock.y) + amount, HEIGHT - 1), 0), prevBlock.orientation, prevBlock.type)
            }
            return prevBlock
        })
    }
    // ****************** Rotates block ******************
    function rotateBlock(){
        setBlock(prevBlock => {
            return new Block(prevBlock.x, prevBlock.y, (prevBlock.orientation + 1) % 4, prevBlock.type)
        })
    }

    // ****************** Arrow key event handler ******************
    function keyPressCallback(key){
        switch(key){
            case 'ArrowRight':
                moveBlock('x', 1)
                break
            case 'ArrowDown':
                moveBlock('y', 1)
                break
            case 'ArrowLeft':
                moveBlock('x', -1)
                break
            case 'ArrowUp':
                rotateBlock()
                break
        }
    }

    // ******************************************************** 
    // **************************** Render **************************** 
    // ******************************************************** 
  return (
    // **************************** Render Screen **************************** 
    <div className="main">
        {/**************************** Render Timer ****************************/}
        <Timer ticks={ticks} setTicks={setTicks} speed={speed}/>
        <Board 
            cell_size={CELL_SIZE}
            width={WIDTH}
            height={HEIGHT}
            squares={squares}
            setSquares={setSquares}
            block={block}
            ticks={ticks}
            newBlock={newBlock}
            boardOn={boardOn}
        />
        <KeyPress keyPressCallback={keyPressCallback}/>
        <Agent
            WIDTH={WIDTH}
            HEIGHT={HEIGHT}
            keyPressCallback={keyPressCallback}
            squares={squares}
            block={block}
            ticks={ticks}
        />
        <button
            className="ai-button"
            onClick={() => setBoardOn(prevBoardOn => {return !prevBoardOn})}
        >
            Show
        </button>
        Speed: {speed / 1000}s
        <input
            type="range"
            // value={"0"}
            onChange={e=> {const speeds = [2000, 250, 25]; setSpeed(speeds[e.target.value])}}
            min="0"
            max="2"
            step="1"
            >
        </input>
    </div>
  )
}

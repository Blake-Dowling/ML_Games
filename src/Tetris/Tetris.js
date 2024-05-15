import React, {useState, useEffect} from 'react'
import './Tetris.css'
import axios from 'axios'
import Timer from './Timer'
import Board from '../View/Board'
import KeyPress from '../Controller/KeyPress'
import Agent from '../Controller/Agent'

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
        // if (this.type===0){
        //     console.log(this.orientation)
        // }
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
export default function Tetris() {
    // ****************** Define model states ******************
    const [ticks, setTicks] = useState(0) //Tracks ticks
    const [completions, setCompletions] = useState([])
    const [aIOn, setAIOn] = useState(false) //Switch for AI
    const [boardOn, setBoardOn] = useState(true) //Switch for Board
    const [speed, setSpeed] = useState(100) //Switch for Board
    
    const [squares, setSquares] = useState(null) //Board squares
    const [block, setBlock] = useState(new Block(0, 0, 0, 0)) //Active game piece
    
    useEffect(() => {newBlock()}, []) // Spawn block on init

    // ****************** Move block down each tick ******************
    useEffect(() => {setBlock(prevBlock=>{ return new Block(prevBlock.x, prevBlock.y+1, prevBlock.orientation, prevBlock.type)})}, [ticks])

    // ****************** Initialize completions ******************
    useEffect(() => {
        setCompletions(() => {
            const typeRow = [0, 0, 0, 0]
            let types = []
            for(let i=0; i<5; i ++){
                types.push(typeRow)
            }
            return types
        })
    }, [])

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

    // ****************** Train ML model ******************
    function sendTrainBatch(typeInput, heightsInput, xOutput, oOutput){
        // console.log(typeInput, oOutput)
        setCompletions(prevCompletions => {
            let newCompletions = JSON.parse(JSON.stringify(prevCompletions))
            newCompletions[typeInput][oOutput] ++
            return newCompletions
        })
        const scaledTypeInput = minMaxScaleBlockType(typeInput)
        const scaledHeightsInput = minMaxScaleHeights(heightsInput)
        axios.post('http://localhost:3001/trainModel', {
                typeInput: scaledTypeInput,
                heightsInput: scaledHeightsInput,
                xOutput: xOutput,
                oOutput: oOutput
            }
        )
        .then(response => {
            // const accuracy = response.data.response.history.acc
            // console.log("acc: ", response.data.response)
            const loss = response.data.response.history.loss[2]
            // const weights = response.data.weights
            console.log("loss: ", loss)
            // console.log(weights)
        })
        .catch(error => console.error('Error:', error))
    }

    function minMaxScaleHeights(heights){
        let newHeights = JSON.parse(JSON.stringify(heights))
        for(let i=0; i<newHeights.length; i++){
            newHeights[i] = newHeights[i] / HEIGHT
        }

        return newHeights
    }


    function minMaxScaleBlockType(blockType){
        let newBlockType = JSON.parse(JSON.stringify(blockType))
        newBlockType = newBlockType / 5
        return [newBlockType]
    }

    // ****************** Get board column heights ******************
    function getHeightsInput(prevBlock, squares){
        let blockType = [prevBlock.type]
        let heights = []
        for(let i=0; i<WIDTH; i++){
            heights.push(0)
        }
        if(squares === null){
            return [blockType, heights]
        }
        for(let r=0; r<(squares.length); r++){
            for(let c=0; c<squares[r].length; c++){
                if(squares[r][c] === 1 && heights[c] === 0){
                    heights[c] = HEIGHT - r
                }
            }
        }
        
        return [blockType, heights]
    }
    function getHeightsInputScaled(prevBlock, squares){
        let heightsInput = getHeightsInput(prevBlock, squares)
        let newBlockInput = minMaxScaleBlockType(heightsInput[0])
        let newHeightsInput = minMaxScaleHeights(heightsInput[1])
        return [newBlockInput, newHeightsInput]
    }
    // ******************************************************** 
    // **************************** Render **************************** 
    // ******************************************************** 
  return (
    // **************************** Render Screen **************************** 
    <div className="main">
        {/**************************** Render Timer ****************************/}
        <Timer ticks={ticks} setTicks={setTicks} speed={speed}/>
        Completions: {completions?.reduce((accumulator, row) => {
                        const innerSum = row.reduce((innerAcc, value) => {return innerAcc + value}, 0)
                        return accumulator + innerSum
                        }, 0)}
        <div className="completions">
        {completions?.map((typeArray, idx) => {
            return <div>Type {idx}: {typeArray.map((oCount, idx2) => {
                return <div>{idx===0 && idx2 + ': '} {oCount}</div>
            })}</div>
        })}
        </div>
        <Board 
            cell_size={CELL_SIZE}
            width={WIDTH}
            height={HEIGHT}
            squares={squares}
            setSquares={setSquares}
            block={block}
            ticks={ticks}
            newBlock={newBlock}
            sendTrainBatch={sendTrainBatch}
            getHeightsInput={getHeightsInput}
            boardOn={boardOn}
            setCompletions={setCompletions}
        />
        <KeyPress keyPressCallback={keyPressCallback}/>
        <Agent
            
            aIOn={aIOn}
            keyPressCallback={keyPressCallback}
            squares={squares}
            block={block}

            getHeightsInputScaled={getHeightsInputScaled}

            ticks={ticks}

        />
        <button
            className="ai-button"
            onClick={() => setAIOn(prevAIOn => {return !prevAIOn})}
        >
            AI
        </button>
        <button
            className="ai-button"
            onClick={() => setBoardOn(prevBoardOn => {return !prevBoardOn})}
        >
            Show
        </button>
        Speed: {speed / 1000}s
        <input
        type="range"
        // value={speed}
        onChange={e=> {const speeds = [500, 100, 25]; setSpeed(speeds[e.target.value])}}
        min="0"
        max="2"
        step="1"
        >
        </input>
    </div>
  )
}

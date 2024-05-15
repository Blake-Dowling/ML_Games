import React, {useState, useEffect} from 'react'
import '../Style/Main.css'

const CELL_SIZE = 40


export default function Board(props) {
    const [board, setBoard] = useState([[]])
    function initializeBoard(){
        const array = []
        for(let r=0; r<props.HEIGHT; r++){

            const row = []
            for(let c=0; c<props.WIDTH; c++){
                row.push(0)
            }
            array.push(row)
        }
        setBoard(array)
    }
    useEffect(() => {    
        initializeBoard()
    }, [])
    //Todo: multi-cell object
    function ob(object){
        if(board === null || board === undefined){
            return true
        }
        //General check for now
        if(object.x >= props.WIDTH || object.y >= props.HEIGHT){
            return true
        }
        return false
    }
    //Todo: multicell object
    function drawObject(object){
        if(board === null || board === undefined || ob(object)){
            return
        }
        setBoard(prevBoard => {
            let newBoard = JSON.parse(JSON.stringify(prevBoard))
            newBoard[object.y][object.x] = object.val
            return newBoard
        })
    }
    useEffect(() => {
        initializeBoard()
        drawObject(props.piece)
        for(let i=0; i<props.rocks.length; i++){
            drawObject(props.rocks[i])
        }
    }, [props.ticks, props.piece, props.rocks])

    function cellColor(rowIndex, columnIndex){
        if(board[rowIndex][columnIndex] === 1){
            return 'black'
        }
        else if(board[rowIndex][columnIndex] === 0){
            return 'white'
        }
        return 'black'
    }

    return (
        <div className='board'>
            {board?.map((row, rowIndex) => {
                return(<div className='row'>
                    {row?.map((square, columnIndex) => {
                        return (<div className='cell' style={{
                            width: `${CELL_SIZE*1}px`,
                            height: `${CELL_SIZE*1}px`,
                            background: `${cellColor(rowIndex, columnIndex)}`
                            }}
                        >

                        </div>)
                    })}
                </div>)
            })}
        </div>
    )
}

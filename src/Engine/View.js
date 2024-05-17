import React, {useState, useEffect} from 'react'

import { Board } from './Objects'
const CELL_SIZE = 40



export function View(props) {
    const board = props.board
    const setBoard = props.setBoard

    useEffect(() => {
        props.setBoard(new Board(props.WIDTH, props.HEIGHT, []))
    }, [])

    function cellColor(rowIndex, columnIndex){
        const cellVal = board?.board[rowIndex][columnIndex]
        return cellVal == 2 ? 'red' : cellVal == 1 ? 'black' : 'white'
    }

    return (
        <div className='board'>
            {props.board?.board?.map((row, rowIndex) => {
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

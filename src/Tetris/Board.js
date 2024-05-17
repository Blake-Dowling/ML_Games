import React, {useState, useEffect} from 'react'
let prevBlock = null
let prevSquares = null
let lastXCompletion = null
let lastOrientation = null
export default function Board(props) {
    const CELL_SIZE=props.cell_size
    const WIDTH=props.width
    const HEIGHT=props.height
    const squares=props.squares
    const setSquares=props.setSquares
    

    // ****************** Initialize Squares ******************
    function initializeSquares(){
        const array = []
        for(let r=0; r<HEIGHT; r++){
            const row = []
            for(let c=0; c<WIDTH; c++){
                row.push(0)
            }
            array.push(row)
        }
        setSquares(array)
    }
    useEffect(() => {    
        initializeSquares()
    }, [])

    // ****************** Every time block moves ******************
    // useEffect(() => {
    //     checkBlockStop(props.block)
    // }, [props.block])
        
    // ****************** Every time board changes ******************
    // useEffect(() => {
    //     checkCompleteRows()
    //     checkFullColumn()
    // }, [squares])

    function blockInBounds(block){
        const blockX = block[0]
        const blockY = block[1]
        return (blockX >= 0 && blockX <= WIDTH-1 && blockY >=0 && blockY <= HEIGHT-1)
    }


    // ****************** Add block to squares ******************
    function addBlockToSquares(block){
        prevBlock = JSON.parse(JSON.stringify(block))
        prevSquares = JSON.parse(JSON.stringify(props.squares))

        let newSquares = JSON.parse(JSON.stringify(prevSquares))
        //Todo: loop through block squares
        for(let i=0; i<block?.blocks?.length; i++){
            if(blockInBounds(block?.blocks[i])){
                newSquares[block?.blocks[i][1]][block?.blocks[i][0]] = 1
            }
        }
        setSquares(prevSquares => {
            return newSquares
        })

    }

    // ****************** Check if block needs to stop ******************
    // function checkBlockStop(block){
    //     //Todo: loop through block squares
    //     if(block === undefined){
    //         return
    //     }
    //     for(let i=0; i<block.blocks.length; i++){
    //         let curBlock = block.blocks[i]
    //         if(curBlock[1] == HEIGHT-1 || (squares && blockInBounds(curBlock) && squares[(curBlock[1])+1][curBlock[0]] === 1)){
    //             lastXCompletion = block?.x
    //             lastOrientation = block?.orientation
    //             addBlockToSquares(block)
    //             props.newBlock()
    //             break
    //         }
    //     }
    // }

    function mDArrayContains(mDArray, el){
        return mDArray?.map(e=>{return e.toString() === el.toString()}).includes(true)
    }
    // ****************** Helper for square div to decide color ******************
    function squareColor(rowIndex, columnIndex, square){
        if(mDArrayContains(props.block?.blocks, [columnIndex, rowIndex])){
            return 'lime'
        }
        else if(square == 1){
            return 'lightblue'
        }
        return 'black'
    }

    // ****************** Delete completed row and move upper squares down ******************
    function handleCompleteRow(row){
        setSquares(prevSquares => {
            let newSquares = JSON.parse(JSON.stringify(prevSquares))
            for(let r=row; r>=1; r--){
                newSquares[r] = newSquares[r-1]
            }
            return newSquares
        })
    }

    // ****************** Check each row for completion ******************
    // function checkCompleteRows(){
    //     for(let r=(squares?.length)-1; r>=0; r--){
    //         let complete = true
    //         for(let c=0; c<squares[r]?.length; c++){
    //             if(squares[r][c] == 0){
    //                 complete = false
    //             }
    //         }
    //         if(complete){
    //             handleCompleteRow(r)
    //             r --
    //         }
    //     }
    // }

    // ****************** Check if column full ******************
    function checkFullColumn(){
        if(squares == null || squares.length === 0){
            return false
        }
        const topRow = squares[0]
        if(topRow.length === 0){
            return false
        }
        for(let c=0; c<topRow.length; c++){
            if(topRow[c] === 1){
                initializeSquares()
                return true
            }
        }
        return false
    }

    //********************************************************/
    //**************************** Render ****************************/
    //********************************************************/
    return (
        //**************************** Game Rectangle ****************************/
        <div className="view" >
            {/**************************** Render Rows ****************************/}
            {props.boardOn && squares?.map((row, rowIndex) => {
                return <div className="row">
                    {/**************************** Render Squares for Row ****************************/}
                    {row?.map((square, columnIndex) => {
                        // return <div>{JSON.stringify(square)}</div>
                    {/**************************** Render Square ****************************/}
                    return <div className="square" style={{
                                                            width: `${CELL_SIZE*1}px`,
                                                            height: `${CELL_SIZE*1}px`,
                                                            background: `${squareColor(rowIndex, columnIndex, square)}`
                                                            }}>
                            </div>
                        })
                    }
                </div>
                })
            }
            {/**************************** Column Labels ****************************/}
            <div className="col-labels">
                {props.boardOn && Array.from({ length: WIDTH }, (_, index) => index)?.map(col => {
                    return <div className="square" style={{
                                                        width: `${CELL_SIZE*1}px`,
                                                        height: `${CELL_SIZE*1}px`,
                                                        background: `white`,
                                                        }}>
                                                            {col}
                            </div>
                }
                )}
            </div>
    </div>
    )
}

import React, {useState, useEffect} from 'react'
import axios from 'axios'
import './Tetris.css'

export default function Agent(props) {

    const [xPrediction, setXPrediction] = useState(null)
    const [oPrediction, setOPrediction] = useState(null)
    
    useEffect(()=>{mlPredict()}, [props.squares]) //New prediction when board changes

    // ****************** AI move each tick ******************
    useEffect(()=>{
        if(props.aIOn){
            mlMove(props.block)
        }
    }, [props.ticks])

    // ****************** AI Press Key ******************
    function pressKey(key){
        props.keyPressCallback(key)
    }

    // ****************** Get prediction from server ******************
    function getPrediction(typeInput, heightsInput){
        axios.post('http://localhost:3001/getPrediction', {
            typeInput: typeInput,
            heightsInput: heightsInput
        })
            .then(response => {
                const xOutput = response.data.response.xOutput
                const oOutput = response.data.response.oOutput
                
                setXPrediction(xOutput)
                setOPrediction(oOutput)
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    // ****************** Get prediction ******************
    function mlPredict(){
        const input = props.getHeightsInputScaled(props.block, props.squares)
        if(input !== undefined){
            getPrediction(input[0], input[1])
        }
    }

    // ****************** AI use prediction to move ******************
    function mlMove(block){
        let xInc = 0
        if(block.x < xPrediction){
            pressKey('ArrowRight')
        }
        else if(block.x > xPrediction){
            pressKey('ArrowLeft')
        }
        if(block.orientation != oPrediction){
            pressKey('ArrowUp')
        }
    }

  return (
    <div>
        <div >
            X:
            {xPrediction}
        </div>
        <div>
            Orientation:
            {oPrediction}
        </div>
    </div>
  )
}

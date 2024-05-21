import React, {useState, useEffect} from 'react'
import Chart from "chart.js/auto";
import { Line } from 'react-chartjs-2'

let losses = []
let scores = []
let epochs = []

export function TrainingChart(props) {
    function render(model){
        console.log("LOADING: ", model)
        losses = JSON.stringify(model?.trainingHistory)
        if(losses){
            losses = JSON.parse(losses)
        }
        scores = JSON.stringify(model?.scoreHistory)
        if(scores){
            scores = JSON.parse(scores)
        }
        epochs = []
        for(let i=0; i<model?.trainingHistory?.length; i++){
            epochs.push(i)
        }
    }
    useEffect(() => {
        render(props.onlineModel)
    }, [])
    useEffect(() => {
        render(props.onlineModel)
    }, [props.onlineModel])

    const data = {
        labels: epochs,
        datasets: [
            {
                label: 'Loss',
                yAxisID: 'A',
                // fill: false,
                // lineTension: 0.1,
                backgroundColor: 'rgba(220,20,60,0.4)',
                borderColor: 'rgba(220,20,60,1)',
                // borderCapStyle: 'butt',
                // borderDash: [],
                // borderDashOffset: 0.0,
                // borderJoinStyle: 'miter',
                // pointBorderColor: 'rgba(220,20,60,1)',
                // pointBackgroundColor: '#fff',
                // pointBorderWidth: 1,
                // pointHoverRadius: 5,
                // pointHoverBackgroundColor: 'rgba(220,20,60,1)',
                // pointHoverBorderColor: 'rgba(220,20,60,1)',
                // pointHoverBorderWidth: 2,
                pointRadius: 1,
                // pointHitRadius: 10,
                data: losses
            },
            {
                label: 'Score',
                yAxisID: 'B',
                // fill: false,
                // lineTension: 0.1,
                backgroundColor: 'rgba(0,0,205,0.4)',
                borderColor: 'rgba(0,0,205,1)',
                // borderCapStyle: 'butt',
                // borderDash: [],
                // borderDashOffset: 0.0,
                // borderJoinStyle: 'miter',
                // pointBorderColor: 'rgba(0,0,205,1)',
                // pointBackgroundColor: '#fff',
                // pointBorderWidth: 1,
                // pointHoverRadius: 5,
                // pointHoverBackgroundColor: 'rgba(0,0,205,1)',
                // pointHoverBorderColor: 'rgba(0,0,205,1)',
                // pointHoverBorderWidth: 2,
                pointRadius: 1,
                // pointHitRadius: 10,
                data: scores
            },
        ]
    }
    const options = {
        // scales: {
        //   y: {
        //     beginAtZero: true
        //   }
        scales: {
            A: {
                beginAtZero: true,
                position: 'left'
            },
            B: {
                beginAtZero: true,
                position: 'right'
            }
        }
        // }
      };
  return (
    <div>
        <Line
            data={data} 
            options={options}
        />
    </div>
  )
}

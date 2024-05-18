import React from 'react'
import Chart from "chart.js/auto";
import { Line } from 'react-chartjs-2'

export function TrainingChart(props) {
    // console.log("scores: ", props.onlineModel)
    // let losses = JSON.stringify(props.onlineModel?.trainingHistory)
    // if(losses){
    //     losses = JSON.parse(losses)
    // }
    // let scores = JSON.stringify(props.onlineModel?.scoreHistory)
    // if(scores){
    //     scores = JSON.parse(scores)
    // }
    const epochs = []
    for(let i=0; i<props.onlineModel?.trainingHistory?.length; i++){
        epochs.push(i)
    }
    const data = {
        labels: epochs,
        datasets: [
            {
                label: 'Loss',
                yAxisID: 'A',
                fill: false,
                lineTension: 0.1,
                backgroundColor: 'rgba(220,20,60,0.4)',
                borderColor: 'rgba(220,20,60,1)',
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(220,20,60,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(220,20,60,1)',
                pointHoverBorderColor: 'rgba(220,20,60,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: props.onlineModel?.trainingHistory
            },
            {
                label: 'Score',
                yAxisID: 'B',
                fill: false,
                lineTension: 0.1,
                backgroundColor: 'rgba(0,0,205,0.4)',
                borderColor: 'rgba(0,0,205,1)',
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(0,0,205,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(0,0,205,1)',
                pointHoverBorderColor: 'rgba(0,0,205,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: props.onlineModel?.scoreHistory
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
    <div>Chart
        <Line
            data={data} 
            options={options}
        />
    </div>
  )
}

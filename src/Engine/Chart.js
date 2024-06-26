import React, {useState, useEffect} from 'react'
import Chart from "chart.js/auto";
import { Line } from 'react-chartjs-2'

function generateRange(number, batchSize){
    let range = []
    for(let i=1; i<=number; i++){
        range.push(i*batchSize)
    }
    return range
}

export function TrainingChart(props) {
    
    const [data, setData] = useState(undefined)

    function updateData(){
        return {
            // ...prevData,
            // labels: generateRange(props.agent?.onlineModel?.scoreHistory?.length, props.agent?.BATCH_SIZE),
            labels: props.agent?.onlineModel?.sampleCountHistory,
            datasets: [
                {
                    label: 'Accuracy',
                    yAxisID: 'A',
                    backgroundColor: 'rgba(220,20,60,0.4)',
                    borderColor: 'rgba(220,20,60,1)',
                    pointRadius: 1,
                    data: props.agent?.onlineModel?.accuracyHistory
                },
                {
                    label: 'Score',
                    yAxisID: 'B',
                    backgroundColor: 'rgba(0,0,205,0.4)',
                    borderColor: 'rgba(0,0,205,1)',
                    pointRadius: 1,
                    data: props.agent?.onlineModel?.scoreHistory
                },
            ]
        }
    }

    useEffect(() => {
        setData(updateData())
    }, [props.agent, props.agent?.onlineModel?.scoreHistory])

    
    const options = {
        // scales: {
        //   y: {
        //     beginAtZero: true
        //   }
        animation: {
            duration: 0
        },
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
        {data && 
        <Line
            data={data} 
            options={options}
        />
        }
    </div>
  )
}

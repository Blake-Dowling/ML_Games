import React, {useState, useEffect} from 'react'
import Chart from "chart.js/auto";
import { Line } from 'react-chartjs-2'

function generateRange(number){
    let range = []
    for(let i=1; i<=number; i++){
        range.push(i)
    }
    return range
}

export function TrainingChart(props) {
    
    const [data, setData] = useState(undefined)

    function updateData(){
        return {
            // ...prevData,
            labels: generateRange(props.agent?.onlineModel?.trainingHistory?.length),
            datasets: [
                {
                    label: 'Loss',
                    yAxisID: 'A',
                    backgroundColor: 'rgba(220,20,60,0.4)',
                    borderColor: 'rgba(220,20,60,1)',
                    pointRadius: 1,
                    data: props.agent?.onlineModel?.trainingHistory
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
    }, [props.agent, props.agent?.onlineModel?.trainingHistory])

    
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

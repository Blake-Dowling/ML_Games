import React, { useState, useEffect } from 'react';

export default function TimerComponent(props){
  const [speed, setSpeed] = useState(0)
  const handleTick = () => {
    props.setTicks((prevTicks) => prevTicks + 1);
  };

  useEffect(() => {
    if(speed > 0 && props.ticks < 512){
      const timerId = setInterval(handleTick, speed); 
      return () => {
        clearInterval(timerId);
      };
    }
  }, [speed]); 

  return (
    <div>
      <p>Ticks: {props.ticks}</p>
      <input
        type="range"
        onChange={e=> {const speeds = [0, 5000, 1000, 100]; setSpeed(speeds[e.target.value])}}
        min="0"
        max="3"
        step="1"
        >
        </input>
    </div>
  );
};



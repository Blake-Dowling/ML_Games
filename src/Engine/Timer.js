import React, { useState, useEffect } from 'react';

export function Timer(props){
  const [speed, setSpeed] = useState(1000)
  const handleTick = () => {
    props.setTicks((prevTicks) => prevTicks + 1);
  };

  useEffect(() => {
    const timerId = setInterval(handleTick, speed); 
    return () => {
      clearInterval(timerId);
    };
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



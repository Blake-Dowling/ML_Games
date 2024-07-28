import React, { useState, useEffect } from 'react';

export function Timer(props){
  const [speed, setSpeed] = useState(200)
  const handleTick = () => {
    props.setTicks((prevTicks) => prevTicks + 1);
  };

  useEffect(() => {
    if(speed > 0){
      const timerId = setInterval(handleTick, speed);
      return () => {
        clearInterval(timerId);
      };
    }
  }, [speed]); 

  return (
    <div>
      {/* {props.ticks} */}
      Speed
      <input
        type="range"
        onChange={e=> {const speeds = [0, 5000, 500, 200, 100, 50, .0001]; setSpeed(speeds[e.target.value])}}
        min="0"
        max="6"
        step="1"
        defaultValue={3}
        >
        </input>
    </div>
  );
};



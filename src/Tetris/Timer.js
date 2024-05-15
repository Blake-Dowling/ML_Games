import React, { useState, useEffect } from 'react';

const TimerComponent = (props) => {

  const ticks = props.ticks;
  const setTicks = props.setTicks;
  // Function to be executed on each tick
  const handleTick = () => {
    setTicks((prevTicks) => prevTicks + 1);
    // Your additional logic for each tick
  };

  // Set up the timer when the component mounts
  useEffect(() => {
    const timerId = setInterval(handleTick, props.speed); // 1000 milliseconds = 1 second

    // Clean up the timer when the component unmounts
    return () => {
      clearInterval(timerId);
    };
  }, [props.speed]); // Empty dependency array ensures the effect runs only once on mount

  return (
    <div>
      <p>Ticks: {ticks}</p>
      {/* Your component rendering logic */}
    </div>
  );
};

export default TimerComponent;

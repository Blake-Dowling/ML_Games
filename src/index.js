import React from 'react';
import ReactDOM from 'react-dom/client';
import { Routes, Route } from 'react-router-dom'
import './index.css';
import { Jump } from './Jump/Jump';
// import { Tetris } from './Tetris/Tetris'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Jump />
  </React.StrictMode>
);


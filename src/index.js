import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import { Routes, Route, Link, BrowserRouter } from 'react-router-dom'
import { Home } from './Home/Home'
import { Jump } from './Jump/Jump'
import { Tetris } from './Tetris/Tetris'

function App(){
  return (
    <div className="App">
      <div className="header">
        <nav className="nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/jump">Jump</Link></li>
            <li><Link to="/tetris">Tetris</Link></li>
          </ul>
        </nav>  
      </div>
      <Routes>
        <Route path='/' element={<Home/>}></Route>
        <Route path='/jump' element={<Jump/>}></Route>
        <Route path='/tetris' element={<Tetris/>}></Route>
      </Routes>

    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);


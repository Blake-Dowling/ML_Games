import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import { Routes, Route, Link, BrowserRouter } from 'react-router-dom'
import { Home } from './Home/Home.js'
import { Jump } from './Jump/Jump.js'
import { Tetris } from './Tetris/Tetris.js'
import { Engine } from './Engine/Engine.js'

function App(){
  const [game, setGame] = useState(1)
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
        <Route path='/jump' element={<Engine game={0}/>}></Route>
        <Route path='/tetris' element={<Engine game={1}/>}></Route>
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


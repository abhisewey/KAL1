import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import Intro from "./Pages/Intro";
import Login from './Pages/LoginModel'
import './App.css'
import Home from './Pages/Home';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home/>}/>
    </Routes>
    </>
  )
}

export default App

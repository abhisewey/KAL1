import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import Intro from "./Pages/Intro";
import Login from './Pages/Signup'
import Signup from './Pages/Signup'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
    </>
  )
}

export default App

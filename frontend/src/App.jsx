import { Routes, Route } from "react-router-dom";
import Intro from "./Pages/Intro";
import Home from "./Pages/Home";
import AppLayout from "./Layout/Applayout"; 
function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTE — No navbar/footer */}
      <Route path="/" element={<Intro />} />

      {/* PROTECTED ROUTES — Navbar + Footer always visible */}
      <Route element={<AppLayout />}>
        <Route path="/home" element={<Home />} />
        {/* Add more authenticated Pages here */}
      </Route>
    </Routes>
  );
}

export default App;

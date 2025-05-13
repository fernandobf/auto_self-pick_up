// import { Routes, Route } from "react-router-dom";
import { HashRouter as Router, Route } from 'react-router-dom';

import Login from "./components/Login";
import StudentList from "./components/StudentList";
import LiveCheckouts from "./components/ClassList"; // Importe o novo componente

function App() {
  return (
    <Router>
      <Route path="/" element={<Login />} />
      <Route path="/students" element={<StudentList />} />
      <Route path="/sala" element={<LiveCheckouts />} /> {/* Nova rota */}
    </Router>
  );
}

export default App;

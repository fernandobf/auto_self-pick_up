// App.tsx
import { Routes, Route } from "react-router-dom"; // Use Routes ao invés de Router
import Login from "./components/Login";
import StudentList from "./components/StudentList";
import LiveCheckouts from "./components/ClassList";
import Header from "./components/Header";

function App() {
  return (
    <>
      <Header/>
      <Routes> {/* Use Routes para renderizar as rotas */}
        <Route path="/" element={<Login />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/sala" element={<LiveCheckouts />} />
      </Routes>
    </>
  );
}

export default App;

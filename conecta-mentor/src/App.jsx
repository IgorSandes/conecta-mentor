
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from "./Components/pages/Login.jsx";
import { BuscarMentores } from "./Components/pages/BuscarMentores.jsx";
import { AgendarSessao } from "./Components/pages/AgendarSessao.jsx";
import { Chat } from "./Components/pages/Chat.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/buscarmentores" element={<BuscarMentores />} />
        <Route path="/agendar/:id" element={<AgendarSessao />} />
        <Route path="/chat/:id" element={<Chat />} />
      </Routes>
    </Router>
  );
}


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login.jsx";
import { BuscarMentores } from "./pages/BuscarMentores.jsx";
import { Mentorados } from "./pages/Mentorados.jsx";
import { AgendarSessao } from "./pages/AgendarSessao.jsx";
import { Chat } from "./pages/Chat.jsx";
import {Cadastrar} from "./pages/Cadastrar.jsx"
import {SelecionarPerfil} from "./pages/SelecionarPerfil.jsx"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastrar" element={<Cadastrar />} />
        <Route path="/selecionarperfil" element={<SelecionarPerfil />} />
        <Route path="/buscarmentores" element={<BuscarMentores />} />
        <Route path="/mentorados" element={<Mentorados />} />
        <Route path="/agendar/:id" element={<AgendarSessao />} />
        <Route path="/chat/:id" element={<Chat />} />
      </Routes>
    </Router>
  );
}

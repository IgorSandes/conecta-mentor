import '../css/buscarMentores.css';
import { useEffect, useState } from 'react';

export function BuscarMentores() {
  const [userName, setUserName] = useState('Usuário');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:3000/api/user', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Falha ao buscar dados do usuário');
        return res.json();
      })
      .then(data => {
        setUserName(data.nome || 'Usuário');
      })
      .catch(err => {
        console.error(err);
        setUserName('Usuário');
      });
  }, []);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">CONECECTA MENTOR</div>
        <nav>
          <ul className="menu">
            <li>Início</li>
            <li>Sessões</li>
            <li>Mensagens</li>
            <li>Perfil</li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1>Painel do Mentor</h1>
          <span className="user-name">{userName}</span>
          <p className="welcome">Bem-vindo, {userName}</p>
        </header>

        <section className="session-box">
          <h2>Sessões Agendadas</h2>
          {/* Conteúdo das sessões */}
          <div className="session-card">
            <div className="session-info">
              <strong>Mona Fernanda, Metencai</strong>
              <p>Sidação Sipridora</p>
            </div>
            <div className="session-date">14 CK, nmaj</div>
          </div>
          {/* Outros cards */}
          <div className="see-more">Ver mais &gt;</div>
        </section>
      </main>
    </div>
  );
}

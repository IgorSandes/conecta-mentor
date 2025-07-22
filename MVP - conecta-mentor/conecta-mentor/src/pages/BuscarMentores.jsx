import { useEffect, useState } from 'react';
import styles from '../css/buscarMentores.module.css';

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
    <div className={styles.appContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>CONECTA MENTOR</div>
        <nav>
          <ul className={styles.menu}>
            <li>Início</li>
            <li>Sessões</li>
            <li>Mensagens</li>
            <li>Perfil</li>
          </ul>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>Painel do Mentor</h1>
          <span className={styles.userName}>{userName}</span>
          <p className={styles.welcome}>Bem-vindo, {userName}</p>
        </header>

        <section className={styles.sessionBox}>
          <h2>Sessões Agendadas</h2>

          <div className={styles.sessionCard}>
            <div className={styles.sessionInfo}>
              <strong>Mona Fernanda, Metencai</strong>
              <p>Sidação Sipridora</p>
            </div>
            <div className={styles.sessionDate}>14 CK, nmaj</div>
          </div>

          <div className={styles.seeMore}>Ver mais &gt;</div>
        </section>
      </main>
    </div>
  );
}

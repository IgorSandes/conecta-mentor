import { FaUser, FaLock } from 'react-icons/fa';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/login.module.css';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('id', data.id)
        navigate('/definirperfil');
      } else {
        alert('Erro no login: ' + data.message);
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor');
      console.error(error);
    }
  };

  return (
    <div className={styles.login}>
      <div className={styles.container}>
        <form onSubmit={handleSubmit}>
          <h1>Conecta Mentor</h1>

          <div className={styles.inputField}>
            <input
              type="email"
              placeholder="E-mail"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              required
            />
            <FaUser className={styles.icon} />
          </div>

          <div className={styles.inputField}>
            <input
              type="password"
              placeholder="Senha"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <FaLock className={styles.icon} />
          </div>

          <div className={styles.recallForget}>
            <label>
              <input type="checkbox" />
              Lembre de mim?
            </label>
            <a href="#">Esqueceu a senha?</a>
          </div>

          <button type="submit">Entrar</button>

          <div className={styles.signupLink}>
            <p>Criar uma conta? <a href="./cadastrar">Cadastrar</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}

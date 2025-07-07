import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/login.module.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [exibirSenha, setExibirSenha] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('id', data.id);
        navigate('/selecionarperfil');
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
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
            <FaUser className={styles.icon} />
          </div>

          <div className={styles.inputField}>
            <FaLock className={styles.iconLeft} />

            <input
              type={exibirSenha ? 'text' : 'password'}
              placeholder="Senha"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
              className={styles.input}
            />

            <span onClick={() => setExibirSenha(!exibirSenha)}>
              {exibirSenha ? (
                <FaEye className={styles.iconRight} />
              ) : (
                <FaEyeSlash className={styles.iconRight} />
              )}
            </span>
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

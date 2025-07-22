import { FaEnvelope } from 'react-icons/fa';
import { useState, useRef } from 'react';
import styles from '../css/deletarUsuario.module.css';

export function DeletarUsuario() {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const emailRef = useRef();

  const id = localStorage.getItem('id');

  const handleDeleteUser = async (event) => {
    event.preventDefault();
    setErro('');
    setSucesso('');

    try {
      const response = await fetch('http://localhost:3000/api/deletarUsuario', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, id }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSucesso('Usuário deletado com sucesso!');
        setEmail('');
      } else {
        const mensagemErro = data.message || data.error || 'Erro ao deletar usuário.';
        setErro(mensagemErro);
        if (mensagemErro.toLowerCase().includes('email')) {
          emailRef.current?.focus();
        }
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setErro('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div className={styles.cadastrar}>
      <div className={styles.container}>
        <form onSubmit={handleDeleteUser}>
          <h1>Conecta Mentor - Cadastro</h1>

          {erro && <p className={styles.error}>{erro}</p>}
          {sucesso && <p className={styles.success}>{sucesso}</p>}


          <div className={styles.inputField}>
            <input
              ref={emailRef}
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FaEnvelope className={styles.icon} />
          </div>

          <button type="submit">Deletar</button>

          <div className={styles.signupLink}>
            <p>
              Fazer login <a href="/">Entrar</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

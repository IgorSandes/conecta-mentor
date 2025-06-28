import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import { useState, useRef } from 'react';
import '../Components/css/cadastrar.css';

export function Cadastrar() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const emailRef = useRef();

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setErro('');
    setSucesso('');

    if (senha !== confirmaSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/criarUsuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSucesso('Usuário criado com sucesso!');
        setNome('');
        setEmail('');
        setSenha('');
        setConfirmaSenha('');
      } else {
        // Verifica mensagens de erro do backend
        const mensagemErro = data.message || data.error || 'Erro ao criar usuário.';
        setErro(mensagemErro);

        // Foco no campo de email se for erro de email
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
    <div className="cadastrar">
      <div className="container">
        <form onSubmit={handleCreateUser}>
          <h1>Conecta Mentor - Cadastro</h1>

          {erro && <p className="error">{erro}</p>}
          {sucesso && <p className="success">{sucesso}</p>}

          <div className="input-field">
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <FaUser className="icon" />
          </div>

          <div className="input-field">
            <input
              ref={emailRef}
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FaEnvelope className="icon" />
          </div>

          <div className="input-field">
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <FaLock className="icon" />
          </div>

          <div className="input-field">
            <input
              type="password"
              placeholder="Confirme a senha"
              value={confirmaSenha}
              onChange={(e) => setConfirmaSenha(e.target.value)}
              required
            />
            <FaLock className="icon" />
          </div>

          <button type="submit">Cadastrar</button>

          <div className="signup-link">
            <p>
              Já tem uma conta? <a href="/">Entrar</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

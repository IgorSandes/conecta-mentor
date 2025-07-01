import { useState } from 'react';
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from '../css/definirPerfil.module.css';

export function DefinirPerfil() {
  const [tipo, setTipo] = useState('');
  const [area, setArea] = useState('');
  const [texto, setTexto] = useState('');
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tipo) {
      return setMensagem({ tipo: 'erro', texto: 'Por favor, selecione um tipo de acesso.' });
    }
    if (!area) {
      return setMensagem({ tipo: 'erro', texto: 'Por favor, selecione a área.' });
    }
    if (!texto.trim()) {
      return setMensagem({ tipo: 'erro', texto: 'Por favor, preencha o campo de texto.' });
    }

    const id = localStorage.getItem('id');
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3000/api/definirperfil', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Enviando token para autenticação
        },
        body: JSON.stringify({ id, tipo, area, texto }), // Sem idade
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMensagem({ tipo: 'sucesso', texto: 'Perfil definido com sucesso!' });
        setTimeout(() => {
          navigate(tipo === 'mentor' ? '/buscarmentores' : '/mentorados', {
            state: { tipo, area, texto },
          });
        }, 1000);
      } else {
        setMensagem({ tipo: 'erro', texto: data.message || 'Erro ao definir o perfil.' });
      }
    } catch (error) {
      console.error('Erro:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro na conexão com o servidor.' });
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.titulo}>Escolha uma opção de acesso à plataforma</h1>

        <div className={styles.botoes}>
          <button
            className={`${styles.botao} ${tipo === 'mentor' ? styles.botaoAtivo : ''}`}
            onClick={() => {
              setTipo('mentor');
              setArea('');
              setTexto('');
              setMensagem({ tipo: '', texto: '' });
            }}
            type="button"
          >
            Entrar como Mentor
          </button>
          <button
            className={`${styles.botao} ${tipo === 'mentorado' ? styles.botaoAtivo : ''}`}
            onClick={() => {
              setTipo('mentorado');
              setArea('');
              setTexto('');
              setMensagem({ tipo: '', texto: '' });
            }}
            type="button"
          >
            Entrar como Mentorado
          </button>
        </div>

        {mensagem.texto && (
          <div
            className={
              mensagem.tipo === 'erro' ? styles.mensagemErro : styles.mensagemSucesso
            }
          >
            {mensagem.texto}
          </div>
        )}

        {tipo && (
          <div className={styles.caixaSelecionado}>
            {tipo === 'mentor' ? (
              <>
                <span>Mentor</span>
                <FaChalkboardTeacher className={styles.icone} title="Mentor" />
              </>
            ) : (
              <>
                <span>Mentorado</span>
                <FaUserGraduate className={styles.icone} title="Mentorado" />
              </>
            )}
          </div>
        )}

        {tipo && (
          <form className={styles.formulario} onSubmit={handleSubmit}>
            <label className={styles.label}>
              {tipo === 'mentor' ? 'Área de Atuação:' : 'Área de Interesse:'}
              <select
                className={styles.select}
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="tecnologia">Tecnologia</option>
                <option value="educacao">Educação</option>
                <option value="saude">Saúde</option>
              </select>
            </label>

            <label className={styles.label}>
              {tipo === 'mentor' ? 'Competências:' : 'Objetivos:'}
              <textarea
                className={styles.textarea}
                maxLength={500}
                placeholder={
                  tipo === 'mentor'
                    ? 'Descreva suas competências'
                    : 'Quais seus objetivos com a mentoria?'
                }
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                required
              />
            </label>

            <button type="submit" className={styles.botaoAcessar}>
              Acessar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

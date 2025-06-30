import { useState } from 'react';
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from '../css/definirPerfil.module.css';

export function DefinirPerfil() {
  const [tipo, setTipo] = useState('');
  const [area, setArea] = useState('');
  const [texto, setTexto] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!tipo) {
      alert('Por favor, selecione um tipo de acesso.');
      return;
    }
    if (!area) {
      alert('Por favor, selecione a área.');
      return;
    }
    if (!texto.trim()) {
      alert('Por favor, preencha o campo de texto.');
      return;
    }

    // Aqui você pode fazer algo com os dados, ex: salvar no estado global, enviar para backend, etc.
    // Por enquanto, vamos só navegar para a próxima página
    navigate(tipo === 'mentor' ? '/buscarmentores' : '/mentorados', { state: { tipo, area, texto } });
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
            }}
            type="button"
          >
            Entrar como Mentorado
          </button>
        </div>

        {tipo && (
          <div className={styles.caixaSelecionado}>
            {tipo === 'mentor' && (
              <>
                <span>Mentor</span>
                <FaChalkboardTeacher className={styles.icone} title="Mentor" />
              </>
            )}
            {tipo === 'mentorado' && (
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

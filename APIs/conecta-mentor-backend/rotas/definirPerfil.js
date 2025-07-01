import { Router } from 'express';
import { getConnection } from '../config/banco.js';
import autenticador from '../middlewares/autenticador.js';
import oracledb from 'oracledb';

const router = Router();

router.post('/definirPerfil', autenticador, async (req, res) => {
  const { tipo, area, texto, idade } = req.body;
  const idUsuario = req.usuario.id;

  if (!tipo || !area || !texto) {
    return res.status(400).json({ success: false, message: 'Campos obrigatórios: tipo, area e texto.' });
  }

  let conn;

  try {
    conn = await getConnection();

    if (tipo === 'mentor') {
      // Verifica se já é mentor
      const checkMentor = await conn.execute(
        `SELECT 1 FROM mentores WHERE id_mentor = :id`,
        [idUsuario],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (checkMentor.rows.length > 0) {
        return res.status(409).json({ success: false, message: 'Este usuário já é um mentor.' });
      }

      // Insere mentor
      await conn.execute(
        `INSERT INTO mentores (id_mentor, area_atuacao, competencias)
         VALUES (:id, :area, :texto)`,
        { id: idUsuario, area, texto },
        { autoCommit: true }
      );

    } else if (tipo === 'mentorado') {
    //   if (!idade) {
    //     return res.status(400).json({ success: false, message: 'Campo idade é obrigatório para mentorado.' });
    //   }

      // Verifica se já é mentorado
      const checkMentorado = await conn.execute(
        `SELECT 1 FROM mentorados WHERE id_mentorado = :id`,
        [idUsuario],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (checkMentorado.rows.length > 0) {
        return res.status(409).json({ success: false, message: 'Este usuário já é um mentorado.' });
      }

      // Insere mentorado
      await conn.execute(
        `INSERT INTO mentorados (id_mentorado, objetivo, area_interesse )
         VALUES (:id, :texto, :area )`,
        { id: idUsuario, texto, area },
        { autoCommit: true }
      );
    } else {
      return res.status(400).json({ success: false, message: 'Tipo inválido. Use "mentor" ou "mentorado".' });
    }

    res.status(201).json({ success: true, message: 'Perfil definido com sucesso!' });

  } catch (err) {
    console.error('Erro ao definir perfil:', err.message);
    res.status(500).json({ success: false, message: 'Erro interno ao definir perfil.', error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;

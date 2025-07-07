import { Router } from 'express';
import autenticador from '../middlewares/autenticador.js';
import { getConnection } from '../config/banco.js';
import oracledb from 'oracledb';

const router = Router();

router.post('/verificarperfil', autenticador, async (req, res) => {
  const { tipo } = req.body;
  const idUsuario = req.usuario.id;

  if (!tipo || (tipo !== 'mentor' && tipo !== 'mentorado')) {
    return res.status(400).json({ success: false, message: 'Tipo inválido. Use "mentor" ou "mentorado".' });
  }

  let conn;

  try {
    conn = await getConnection();

    let query

    if (tipo === 'mentor') {
      query = `SELECT 1 FROM mentores WHERE id_mentor = :id`;
    } else {
      query = `SELECT 1 FROM mentorados WHERE id_mentorado = :id`;
    }

    const result = await conn.execute(
      query,
      [idUsuario],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const possuiPerfil = result.rows.length > 0;

    res.status(200).json({ success: true, possuiPerfil });

  } catch (err) {
    console.error('Erro ao verificar perfil:', err.message);
    res.status(500).json({ success: false, message: 'Erro interno ao verificar perfil.', error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;

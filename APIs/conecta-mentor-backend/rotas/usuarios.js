import { Router } from 'express';
import { getConnection } from '../config/banco.js';
import autenticarToken from '../middlewares/autenticador.js';

const router = Router();

router.get('/user', autenticarToken, async (req, res) => {
  const userId = req.usuario.id;

  let conn;
  try {
    conn = await getConnection();
    const sql = `SELECT nome FROM usuarios WHERE id = :id`;
    const result = await conn.execute(sql, [userId], { outFormat: 5001 }); // 5001 = oracledb.OUT_FORMAT_OBJECT

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    return res.json({ nome: result.rows[0].NOME });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro interno no servidor' });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;

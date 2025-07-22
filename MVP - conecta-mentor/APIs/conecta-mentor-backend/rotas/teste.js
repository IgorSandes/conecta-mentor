import { Router } from 'express';
import { getConnection } from '../config/banco.js';

const router = Router();

router.get('/ping', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute('SELECT 1 AS status FROM dual');
    res.json({ oracle: 'OK', status: result.rows[0] });
  } catch (err) {
    console.error('Erro ao conectar ao Oracle:', err);
    res.status(500).json({ error: 'Falha ao conectar ao Oracle' });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;

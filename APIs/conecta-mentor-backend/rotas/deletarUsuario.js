import { Router } from 'express';
import { getConnection } from '../config/banco.js';
import autenticador from '../middlewares/autenticador.js';

const router = Router();

router.delete('/deletarUsuario', autenticador, async (req, res) => {
  const { email, id } = req.body;

  if (!email || !id) {
    return res.status(400).json({ success: false, message: 'Email e id são obrigatórios.' });
  }

  let conn;
  try {
    conn = await getConnection();

    const sql = `
      DELETE FROM USUARIOS WHERE EMAIL = :email AND ID = :id
    `;

    await conn.execute(
      sql,
      {
        email,
        id
      },
      { autoCommit: true }
    );

    res.status(201).json({ success: true, message: 'Usuário deletado com sucesso!' });
  } catch (err) {
    console.error('Erro ao deletar usuário:', err.message);
    res.status(500).json({ success: false, message: 'Erro interno ao deletar usuário.', error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;

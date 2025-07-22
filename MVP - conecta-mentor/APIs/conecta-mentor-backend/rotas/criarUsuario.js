import { Router } from 'express';
import bcrypt from 'bcrypt';
import { getConnection } from '../config/banco.js';

const router = Router();

router.post('/criarUsuario', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ success: false, message: 'Nome, email e senha são obrigatórios.' });
  }

  let conn;
  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    conn = await getConnection();

    const sql = `
      INSERT INTO usuarios (nome, email, senha_hash)
      VALUES (:nome, :email, :senha_hash)
    `;

    await conn.execute(
      sql,
      {
        nome,
        email,
        senha_hash: senhaHash
      },
      { autoCommit: true }
    );

    res.status(201).json({ success: true, message: 'Usuário criado com sucesso!' });
  } catch (err) {
    console.error('Erro ao criar usuário:', err.message);
    res.status(500).json({ success: false, message: 'Erro interno ao criar usuário.', error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;

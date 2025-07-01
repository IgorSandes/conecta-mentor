import oracledb from 'oracledb';
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getConnection } from '../config/banco.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios' });
  }

  let conn;
  try {
    conn = await getConnection();

    const sql = `
      SELECT id, email, nome, senha_hash
      FROM usuarios
      WHERE LOWER(email) = LOWER(:email)
    `;
    const result = await conn.execute(sql, [username.trim()], {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
    }

    const user = result.rows[0];
    const senhaValida = await bcrypt.compare(password, user.SENHA_HASH);

    if (!senhaValida) {
      return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
    }

    const token = jwt.sign(
      {
        id: user.ID,
        email: user.EMAIL,
        nome: user.NOME
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.json({ success: true, token, id: user.ID });

  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ success: false, message: 'Erro interno no servidor' });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;

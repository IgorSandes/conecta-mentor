require('dotenv').config();
const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

async function getConnection() {
  return await oracledb.getConnection({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING
  });
}

// Rota de teste
app.get('/api/ping', async (req, res) => {
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

// Rota de login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios' });
  }

  let conn;

  try {
    conn = await getConnection();

    const sql = `
      SELECT id, email, nome, role, senha_hash
      FROM usuarios
      WHERE LOWER(email) = LOWER(:email)
    `;
    const result = await conn.execute(sql, [username.trim()], { outFormat: oracledb.OUT_FORMAT_OBJECT });

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
        nome: user.NOME,
        role: user.ROLE
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.json({ success: true, token });

  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ success: false, message: 'Erro interno no servidor' });
  } finally {
    if (conn) await conn.close();
  }
});

// Rota para buscar nome do usuário pelo token
app.get('/api/user', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    let conn = await getConnection();
    const sql = `SELECT nome FROM usuarios WHERE id = :id`;
    const result = await conn.execute(sql, [userId], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    await conn.close();

    if (result.rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });

    return res.json({ nome: result.rows[0].NOME });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
});

// Inicializa servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});

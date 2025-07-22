import dotenv from 'dotenv';
import oracledb from 'oracledb';
import bcrypt from 'bcrypt';

dotenv.config();

async function resetSenhas() {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING
    });

    const users = await conn.execute(
      'SELECT email FROM usuarios',
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    for (const user of users.rows) {
      const novoHash = await bcrypt.hash('teste123', 10);
      await conn.execute(
        'UPDATE usuarios SET senha_hash = :hash WHERE email = :email',
        { hash: novoHash, email: user.EMAIL },
        { autoCommit: true }
      );
      console.log(`Senha atualizada para ${user.EMAIL}`);
    }

    console.log('✅ Todas as senhas foram redefinidas para teste123.');

  } catch (err) {
    console.error('❌ Erro ao atualizar senhas:', err);
  } finally {
    if (conn) await conn.close();
  }
}

resetSenhas();

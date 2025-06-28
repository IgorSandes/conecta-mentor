import jwt from 'jsonwebtoken';

const JWT_SECRET = 'sua_chave_secreta'; // use a mesma chave do seu backend

// Payload com dados mínimos, ajuste conforme seu sistema
const payload = {
  id: 1,
  email: 'mentor@conecta.com',
  nome: 'Mentor de Teste',
  role: 'mentor'
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

console.log('Token JWT válido:\n');
console.log(token);

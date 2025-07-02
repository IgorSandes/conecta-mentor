import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import criarUsuarioRouter from './rotas/criarUsuario.js';
import autenticacaoRoutes from './rotas/autenticacao.js';
import usuariosRoutes from './rotas/usuarios.js';
import definirPerfilRoutes from './rotas/definirPerfil.js';
import verificarPerfilRoutes from './rotas/verificarPerfil.js';
import testeRoutes from './rotas/teste.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Usa as rotas com prefixo /api
app.use('/api', criarUsuarioRouter);
app.use('/api', autenticacaoRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', definirPerfilRoutes);
app.use('/api', verificarPerfilRoutes);
app.use('/api', testeRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});

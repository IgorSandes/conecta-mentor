import express from 'express';
import cors from 'cors';

import criarUsuarioRouter from './rotas/criarUsuario.js';
import deletarUsuarioRouter from './rotas/deletarUsuario.js';
import autenticacaoRoutes from './rotas/autenticacao.js';
import usuariosRoutes from './rotas/usuarios.js';
import definirPerfilRoutes from './rotas/definirPerfil.js';
import verificarPerfilRoutes from './rotas/verificarPerfil.js';
import testeRoutes from './rotas/teste.js';

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api', criarUsuarioRouter);
app.use('/api', deletarUsuarioRouter);
app.use('/api', autenticacaoRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', definirPerfilRoutes);
app.use('/api', verificarPerfilRoutes);
app.use('/api', testeRoutes);

export default app;

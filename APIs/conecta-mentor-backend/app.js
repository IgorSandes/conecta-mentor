import express from 'express';
import cors from 'cors';

// Criação do app
const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Importa rotas
import criarUsuarioRouters from './rotas/criarUsuario.js'
import autenticacaoRoutes from './rotas/autenticacao.js';
import usuariosRoutes from './rotas/usuarios.js';
import definirPerfilRoutesRoutes from './rotas/definirPerfil.js';
import verificarPerfilRoutes from './rotas/verificarPerfil.js';
import testeRoutes from './rotas/teste.js';

// Usa as rotas com prefixo /api
app.use('/api', criarUsuarioRouters);
app.use('/api', autenticacaoRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', definirPerfilRoutesRoutes);
app.use('/api', verificarPerfilRoutes);
app.use('/api', testeRoutes);

// Exporta o app
export default app;

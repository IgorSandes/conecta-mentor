const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Importa rotas
const autenticacaoRoutes = require('./rotas/autenticacao.js');
const usuariosRoutes = require('./rotas/usuarios.js');
const testeRoutes = require('./rotas/teste.js');

// Usa as rotas com prefixo /api
app.use('/api', autenticacaoRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', testeRoutes);

module.exports = app;

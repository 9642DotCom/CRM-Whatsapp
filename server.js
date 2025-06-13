require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// Inicializa o aplicativo Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Limite de taxa para prevenir abusos
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite de 100 requisições por janela
});
app.use(limiter);

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Rotas da API
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Rota para a página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'landing-page.html'));
});

// Rota para o dashboard (protegida)
app.get('/dashboard', (req, res) => {
    // Aqui você pode adicionar lógica de autenticação
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Rota para extração de contatos
app.post('/api/extract-contacts', (req, res) => {
    // Lógica para extrair contatos
    res.json({ success: true, message: 'Contatos extraídos com sucesso' });
});

// Rota para envio de mensagens
app.post('/api/send-messages', (req, res) => {
    // Lógica para enviar mensagens
    res.json({ success: true, message: 'Mensagens enviadas com sucesso' });
});

// Middleware para tratamento de erros 404
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Middleware para tratamento de erros globais
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Algo deu errado!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});

module.exports = app;

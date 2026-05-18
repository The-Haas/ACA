// Pega as variáveis do .env
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

const app = express();

const PORT = 3000;

const authRoutes = require('./routers/auth');


// Permitir JSON no corpo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Permitir requisições do seu front
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));
app.use('/auth', authRoutes);

require('./routers')(app);

// Servir arquivos do frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));



app.listen(PORT, () => {
    console.log('API Rodando na porta ' + PORT);
    console.log('Acesse: http://localhost:' + PORT);
});
 
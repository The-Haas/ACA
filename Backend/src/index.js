const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

const corsOptions = {
  origin: '*',
  methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
  preflightContinue: false,
  optionsSuccessStatus: 204
}

app.use(cors(corsOptions))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./routers/auth');
app.use('/auth', authRoutes);

require('./routers')(app);

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.listen(PORT, () => {
    console.log('API Rodando na porta ' + PORT);
    console.log('Acesse: http://localhost:' + PORT);
});
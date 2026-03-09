const clienteController = require('../controllers/clientes');

module.exports = (app) => {
    app.post('/clientes', clienteController.postCliente);
    app.get('/clientes', clienteController.getClientes);
};

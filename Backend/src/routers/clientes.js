const clienteController = require('../controllers/clientes');
const { autenticarToken, apenasCliente } = require('../middlewares/authMiddleware');

module.exports = (app) => {
    app.post('/clientes', clienteController.postCliente);
    app.get('/clientes', autenticarToken, apenasCliente, clienteController.getClientes);
    app.put('/clientes/:id', autenticarToken, apenasCliente, clienteController.putCliente);
    app.delete('/clientes/:id', autenticarToken, apenasCliente, clienteController.deleteCliente);
    app.get('/clientes/:id', autenticarToken, apenasCliente, clienteController.getClienteById);
    app.patch('/clientes/:id', autenticarToken, apenasCliente, clienteController.patchCliente);
};

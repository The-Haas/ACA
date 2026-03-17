const clientesRoute = require('./clientes');
const veiculosRoute = require('./veiculos');

module.exports = (app) => {
    clientesRoute(app);
    veiculosRoute(app);
}
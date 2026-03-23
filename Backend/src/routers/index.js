const clientesRoute = require('./clientes');
const veiculosRoute = require('./veiculos');
const categoriaVeiculoRoute = require('./categoriaVeiculo');

module.exports = (app) => {
    clientesRoute(app);
    veiculosRoute(app);
    categoriaVeiculoRoute(app);
}
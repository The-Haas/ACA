const clientesRoute = require('./clientes');
const veiculosRoute = require('./veiculos');
const categoriaVeiculoRoute = require('./categoriaVeiculo');
const categoriaServicoRoute = require('./categoriaServico');
const prestadoresRoute = require('./prestadores');

module.exports = (app) => {
    clientesRoute(app);
    veiculosRoute(app);
    categoriaVeiculoRoute(app);
    categoriaServicoRoute(app);
    prestadoresRoute(app);
}
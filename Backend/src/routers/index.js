const clientesRoute = require('./clientes');

module.exports = (app) => {
    clientesRoute(app);
}
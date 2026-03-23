const prestadoresController = require('../controllers/prestadores');

module.exports = (app) => {

    app.post('/prestadores', prestadoresController.postPrestador);
    app.get('/prestadores', prestadoresController.getPrestador);
    app.get('/prestadores/:id', prestadoresController.getPrestadorById);
    app.put('/prestadores/:id', prestadoresController.putPrestador);
    app.delete('/prestadores/:id', prestadoresController.deletePrestador);


};
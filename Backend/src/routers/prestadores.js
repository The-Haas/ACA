const prestadoresController = require('../controllers/prestadores');
const { autenticarToken, apenasPrestador } = require('../middlewares/authMiddleware');

module.exports = (app) => {

    app.post('/prestadores', prestadoresController.postPrestador);
    app.get('/prestadores', autenticarToken, apenasPrestador, prestadoresController.getPrestador);
    app.get('/prestadores/:id', autenticarToken, apenasPrestador, prestadoresController.getPrestadorById);
    app.put('/prestadores/:id', autenticarToken, apenasPrestador, prestadoresController.putPrestador);
    app.delete('/prestadores/:id', autenticarToken, apenasPrestador, prestadoresController.deletePrestador);
    app.patch('/prestadores/:id', autenticarToken, apenasPrestador, prestadoresController.patchPrestador);


};
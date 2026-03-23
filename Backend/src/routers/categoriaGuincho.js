const categoriaGuinchoController = require('../controllers/categoriaGuincho');

module.exports = (app) => {
    app.post('/categoriaGuincho', categoriaGuinchoController.postCategoriaGuincho);
    app.get('/categoriaGuincho', categoriaGuinchoController.getCategoriasGuincho);
    app.put('/categoriaGuincho/:id', categoriaGuinchoController.putCategoriaGuincho);
    app.delete('/categoriaGuincho/:id', categoriaGuinchoController.deleteCategoriaGuincho);
    app.get('/categoriaGuincho/:id', categoriaGuinchoController.getCategoriaGuinchoById);
};

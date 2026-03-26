const auth = require('../controllers/auth.js');

module.exports = (app) => {
    app.post('/login', auth.login);
};

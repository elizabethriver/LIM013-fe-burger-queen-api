const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
const pool = require('../db-data/modelo');

const { secret } = config;
// console.log( { secret } );
// console.log(secret);
// console.log(adminEmail);
/** @module auth */
module.exports = (app, nextMain) => {
  /**
   * @name /auth
   * @description Crea token de autenticación.
   * @path {POST} /auth
   * @body {String} email Correo3
   * @body {String} password Contraseña
   * @response {Object} resp
   * @response {String} resp.token Token a usar para los requests sucesivos
   * @code {200} si la autenticación es correcta
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @auth No requiere autenticación
   */
  app.post('/auth', (req, resp, next) => {
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
      return next(400);
    }

    // TODO: autenticar a la usuarix
    const values = 'SELECT * FROM users';
    pool.query(values, (err, result) => {
      if (err) throw err;
      console.log(result);
      // eslint-disable-next-line max-len
      if (!(email === result.email && password === result.password && secret)) {
        resp.status(401).send({
          error: 'usuario o contraseña inválidos',
        });
        return;
      }

      const tokenData = {
        email,
        password,
        // ANY DATA
      };

      const token = jwt.sign(tokenData, 'Secret Password', {
        expiresIn: 60 * 60 * 24, // expires in 24 hours
      });

      resp.send({
        token,
      });
    });

    // next();
  });
  return nextMain();
};

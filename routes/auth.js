const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
const pool = require('../db-data/modelo');
// const users = require('../controller/users');

const { secret } = config;

/** @module auth */
/** @module auth */
/** @module auth */
module.exports = (app, nextMain) => {
  /**
   * @name /auth
   * @description Crea token de autenticación.
   * @path {POST} /auth
   * @body {String} email Correo
   * @body {String} password Contraseña
   * @response {Object} resp
   * @response {String} resp.token Token a usar para los requests sucesivos
   * @code {200} si la autenticación es correcta
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @auth No requiere autenticación
   */
  app.post('/auth', (req, resp, next) => {
    const { email, password } = req.body;
    // console.log({ email, password });
    if (!email || !password) {
      resp.status(400).send({ message: 'Passwoord or email cant be empty' });
      return next();
    }

    // TODO: autenticar a la usuarix
    try {
      pool.query(`SELECT * FROM burguerqueen.users WHERE email = '${email}'`, (error, result) => {
        if (error) throw error;
        // eslint-disable-next-line max-len
        const payload = result.find((user) => user.email === email && bcrypt.compareSync(password, user.password));
        // console.log(payload);
        if (payload) {
          // eslint-disable-next-line max-len
          const token = jwt.sign({ email: payload.email, password: payload.password }, secret, { expiresIn: 60 * 60 });
          resp.header('authorization', token);
          resp.status(200).send({ message: 'succesful', token });
          // console.log('user register');
        } else {
          // resp.status(404).send({ message: 'user not registered' });
          // console.log('user not register');
          next(404);
        }
        // next();
      });
    } catch (error) {
      return error;
    }

    // next();
  });
  return nextMain();
};
// console.log('Aqui finaliza');

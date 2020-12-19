const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
const pool = require('../db-data/modelo');
// const users = require('../controller/users');

const { secret } = config;
// console.log( { secret } );
// console.log(secret);
// console.log(adminEmail);
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
    // resp.json({
    //   email: 'elo',
    // });
    const { email, password } = req.body;
    console.log({ email, password });
    if (!email || !password) {
      return next(400);
    }

    // TODO: autenticar a la usuarix
    pool.query(`SELECT * FROM burguerqueen.users WHERE email = '${email}'`, (error, result) => {
      if (error) throw error;
      // // Generate Salt
      // const salt = bcrypt.genSaltSync(10);

      // // Hash Password
      // const hash = bcrypt.hashSync('1234', salt);

      // console.log(hash);

      // eslint-disable-next-line max-len
      const payload = result.find((user) => user.email === email && bcrypt.compareSync(password, user.password));
      // console.log(payload);

      if (payload) {
        const token = jwt.sign({ email: payload.email, password: payload.password }, secret);
        resp.header('authorization', token);
        resp.status(200).send({ message: 'succesful', token });
      } else {
        next(404);
      }
    });
    // next();
  });
  return nextMain();
};
console.log('Aqui finaliza');

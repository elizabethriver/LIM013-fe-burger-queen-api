const jwt = require('jsonwebtoken');
const pool = require('../db-data/modelo');

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;
  // console.log({ authorization });
  if (!authorization) {
    return next();
  }

  const [type, token] = authorization.split(' ');
  // console.log([type, token]);

  if (type.toLowerCase() !== 'bearer') {
    // console.log(type);
    return next();
  }

  jwt.verify(token, secret, (err, decodedToken) => {
    // console.log(token);
    // console.log(decodedToken);
    if (err) {
      return next(403);
    }

    // TODO: Verificar identidad del usuario usando `decodeToken.uid`
    try {
      pool.query(`SELECT * FROM burguerqueen.users where email='${decodedToken.email}'`, (error, result) => {
        // console.log(result);
        if (error) { throw error; }
        const userVerified = result.find((user) => user.email === decodedToken.email);
        // console.log(userVerified);
        if (userVerified) {
          req.user = userVerified;
          console.log(req.user);
          next();
        } else { next(404); }
      });
    } catch (error) {
      next(404);
    }
  });
};

module.exports.isAuthenticated = (req) => {
  if (req.user) {
    // console.log(req.user);
    return true;
  }
  return false;
};
// TODO: decidir por la informacion del request si la usuaria esta autenticada

module.exports.isAdmin = (req) => {
  // TODO: decidir por la informacion del request si la usuaria es admin
  if (req.user.admin === 1) {
    // console.log(req.user.admin);
    return true;
  }
  return false;
};

module.exports.requireAuth = (req, resp, next) => (
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : next()
);

module.exports.requireAdmin = (req, resp, next) => (
  // eslint-disable-next-line no-nested-ternary

  // eslint-disable-next-line no-nested-ternary
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : (!module.exports.isAdmin(req))
      ? next(403)
      : next()

);

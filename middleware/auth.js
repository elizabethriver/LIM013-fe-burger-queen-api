const jwt = require('jsonwebtoken');
const pool = require('../db-data/modelo');

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;
console.log({ authorization });
  if (!authorization) {
    return next();
  }

  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    return next();
  }

  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      return next(403);
    }

    // TODO: Verificar identidad del usuario usando `decodeToken.uid`
    try {
      pool.query('SELECT * FROM burguerqueen.users', (error, result) => {
        if (error) { throw error; }
        // console.log(decodedToken);
        const userVerified = result.find((user) => user.email === decodedToken.email);
        if (userVerified) {
          req.user = userVerified;
          next();
        } else { next(404); }
      });
    } catch (error) {
      next(404);
    }
  });
};

module.exports.isAuthenticated = (req) => {
  console.log(req);
  if (req.body) {
    return true;
  }
  return false;
};
// TODO: decidir por la informacion del request si la usuaria esta autenticada

module.exports.isAdmin = (req) => {
  // TODO: decidir por la informacion del request si la usuaria es admin
  if (req.body) {
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

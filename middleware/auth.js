const jwt = require('jsonwebtoken');
const mysqlConnection = require('../db');

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;

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
    console.log(decodedToken);
    const sql = `SELECT * FROM users WHERE email = "${decodedToken.result[0].email}" `;
    mysqlConnection.query(sql, (error, result) => {
      if (error) throw error;
      if (result) {
        req.user = result[0];
        next();
      } else {
        next(404);
      }
    });

    // TODO: Verificar identidad del usuario usando `decodeToken.uid`
  });
};


module.exports.isAuthenticated = (req) => {
  if (req.user) {
  return true;
}
return false;
};



module.exports.isAdmin = (req) => {
if (req.user) {
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
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : (!module.exports.isAdmin(req))
      ? next(403)
      : next()
);

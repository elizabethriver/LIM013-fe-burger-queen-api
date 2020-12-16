const mysqlConnection = require('../db');

module.exports = {
  getUsers: (req, resp, next) => {
    const sql = 'SELECT * FROM users';
    mysqlConnection.query(sql, (error, result) => {
      if (error) throw error;
      if (result.lenght > 0) {
        return resp.status(200).send(result);
      }
      return resp.status(400).send(error);
    });
  },
};

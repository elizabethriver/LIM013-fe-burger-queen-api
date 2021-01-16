const mysql = require('mysql');
const config = require('../config');

const { dbUrl } = config;
// console.log({ dbUrl });
const pool = mysql.createConnection(dbUrl);
// pool.connect();
// console.log(pool);

// const createTable = (table, values) => {
//   const sql = `CREATE TABLE ${table} ${values}`;
//   pool.query(sql, (err, result) => {
//     if (err) throw err;
//     console.log('Table created');
//   });
// };

pool.connect((err) => {
  if (err) { throw err; }
  // console.log('Connected to DataBase Mysql!');
  // createTable();
  // console.log('Tabla creada!');
});

// eslint-disable-next-line max-len
// const userValues = '( id int NOT NULL AUTO_INCREMENT PRIMARY KEY, email VARCHAR(25), `password` text, rolesAdmin boolean)';
// createTable('users', userValues);
// console.log('Se creo algo');
module.exports = pool;

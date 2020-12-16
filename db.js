const mysql = require('mysql');

const mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Eruliz1987.',
  database: 'burguer_queen',
});
mysqlConnection.connect((err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('db is connect');
});
module.exports = mysqlConnection;

require('dotenv').config({ path: 'secrets.env' });

const mysql = require('mysql');

const db = {
  host: process.env.DB_HOST,
  datebase: process.env.DB_HOST,
  user: process.env.DB_USER_DB,
  password: process.env.DB_PASS,
};

const dbUrl = mysql.createConnection(db);

// dbUrl.query('SELECT * from burguerqueen.users', (err, results, fields) => {
//   if (err) {
//     throw err;
//   }
//   results.forEach((result) => {
//     console.log(result);
//   });
// });
// dbUrl.end();

exports.port = process.argv[2] || process.env.PORT || 8080;
exports.dbUrl = dbUrl;
exports.secret = process.env.JWT_SECRET;
exports.adminEmail = process.env.ADMIN_EMAIL;
exports.adminPassword = process.env.ADMIN_PASSWORD;

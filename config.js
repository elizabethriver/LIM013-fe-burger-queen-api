const mysql = require('mysql');

const conexion = mysql.createConnection({
  host: 'localhost',
  datebase: 'burguerqueen',
  user: 'root',
  password: 'Eruliz1987.',
});

conexion.connect((error) => {
  if (error) {
    throw error;
  } else {
    console.log('CONEXION EXITOSA');
  }
});

conexion.query('SELECT * from burguerqueen.users', (err, results, fields) => {
  if (err) {
    throw err;
  }
  results.forEach((result) => {
    console.log(result);
  });
});
conexion.end();

exports.port = process.argv[2] || process.env.PORT || 8080;
exports.dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/test';
exports.secret = process.env.JWT_SECRET || 'esta-es-la-api-burger-queen';
exports.adminEmail = process.env.ADMIN_EMAIL || 'admin@localhost';
exports.adminPassword = process.env.ADMIN_PASSWORD || 'changeme';

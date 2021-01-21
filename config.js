require('dotenv').config({ path: 'secrets1.env' });

// const mysql = require('mysql');

const db = {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER_DB,
  password: process.env.DB_PASS,
};

// const dbUrl = mysql.createConnection(db);

exports.port = process.argv[2] || process.env.PORT || 8080;
exports.dbUrl = db;
exports.secret = process.env.JWT_SECRET;
exports.adminEmail = process.env.ADMIN_EMAIL;
exports.adminPassword = process.env.ADMIN_PASSWORD;

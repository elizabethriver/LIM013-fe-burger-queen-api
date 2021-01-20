/* eslint-disable max-len */
const pool = require('./modelo.js');

const findAdminExist = (table, keyword, value) => new Promise((resolve, reject) => {
  pool.query(`SELECT * FROM ${table} where ${keyword}=?`, value, (error, result) => {
    // console.log('findaAdminExist', error, result);
    if (error) { throw error; }
    if (result) {
      resolve(result.length);
    }
    reject(error);
  });
});
const getAllData = (table) => new Promise((resolve, reject) => {
  pool.query(`SELECT * FROM ${table}`, (error, result) => {
    if (result.length) {
      resolve(result);
      // console.log(result)
    } else {
      reject(error);
      // console.info(error)
    }
  });
});

const getDataByKeywordPost = (table, keyword, value) => new Promise((resolve, reject) => {
  pool.query(`SELECT * FROM ${table} WHERE ${keyword}=?`, value, (error, result) => {
  // console.log(error);
    // if (result.length > 0) {
    resolve(result);
    // }
    reject(error);
  });
});

const getDataByKeyword = (table, keyword, value) => new Promise((resolve, reject) => {
  pool.query(`SELECT * FROM ${table} WHERE ${keyword}=?`, value, (error, result) => {
    // console.log(result);
    if (result.length > 0) {
      resolve(result);
    } else {
      reject(error);
    }
  });
});

// eslint-disable-next-line max-len
const postData = (table, email, password, roles, adminUserm, adminUserp, adminUserr) => new Promise((resolve, reject) => {
  pool.query(`INSERT INTO ${table} (${email}, ${password}, ${roles}) VALUES ('${adminUserm}', '${adminUserp}', ${adminUserr})`, (error, result) => {
    resolve(result);
    reject(error);
  });
});

const postDataIn = (table, email, password, roles, emailUser, passwordUser, adminUser) => new Promise((resolve, reject) => {
  pool.query(`INSERT INTO ${table} (${email}, ${password}, ${roles}) VALUES ('${emailUser}', '${passwordUser}', ${adminUser})`, (error, result) => {
    resolve(result);
    reject(error);
  });
});

const postingData = (table, toInsert) => new Promise((resolve, reject) => {
  pool.query(`INSERT INTO ${table} SET ?`, toInsert, (error, result) => {
    // console.log(error)
    resolve(result);
    reject(error);
  });
});
// eslint-disable-next-line max-len
const updateDataByKeyword = (table, toUpdate, keyword, value) => new Promise((resolve, reject) => {
  pool.query(`UPDATE ${table} SET ? WHERE ${keyword} = ?`, [toUpdate, value], (error, result) => {
    // console.log(error);
    resolve(result);
    reject(error);
  });
});

const deleteData = (table, id, idValue) => new Promise((resolve, reject) => {
  pool.query(`DELETE FROM ${table} WHERE ${id} = ?`, idValue, (error, result) => {
    // console.log(error);
    resolve(result);
    reject(error);
  });
});

module.exports = {
  getAllData,
  getDataByKeywordPost,
  postDataIn,
  getDataByKeyword,
  postData,
  updateDataByKeyword,
  deleteData,
  findAdminExist,
  postingData,
};

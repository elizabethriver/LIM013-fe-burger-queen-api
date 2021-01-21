// const { getDataByKeyword } = require('../db-data/sql');

const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};
// console.log(validateEmail('emailefre@gewfr.com'));
const checkPassword = (str) => {
  // acepta letras mayusculas y minusculas, minimo 6 caracteres maximo 30
  const re = /[A-Za-z0-9]{6,30}$/;
  return re.test((str));
};

const dataError = (headers, resp) => {
  if (headers) {
    return resp.status(401).send('401');
  }
};

// const getDataProducts = (table, keyword, orderId) => {
//   getDataByKeyword(table, keyword, orderId)
//     .then((result) => {
//       console.log(result);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

// const pagination = (pagesNumber, limitsNumber, result, table, host) => {
//   const pages = (!pagesNumber) ? 1 : pagesNumber;
//   const limits = (!limitsNumber) ? result.length : limitsNumber;
//   const startIndex = (pages - 1) * limits;
//   const endIndex = pages * limits;
//   const usersQueryLimits = result.slice(startIndex, endIndex);
//   const totalPages = Math.ceil(result.length / limits);
//   const previousPage = pages - 1;
//   const nextPage = pages + 1;
//   let link = `<https://${host}/${table}?page=1&limit=${limits}>; rel="first",<https://${host}/${table}?page=${totalPages}&limit=${limits}>; rel="last"`;
//   const results = {
//     link,
//   };

//   if (pages > 0 && pages < (totalPages + 1)) {
//     const prev = `,<https://${host}/${table}?page=${previousPage}&limit=${limits}>; rel="prev",`;
//     const next = `<https://${host}/${table}?page=${nextPage}&limit=${limits}>; rel="next"`;
//     link = link.concat(prev, next);
//     results.link = link;
//     results.list = usersQueryLimits;
//   }
//   return results;
// };
// console.log(checkPassword('121frer..8989.egre232'));
module.exports = {
  validateEmail,
  checkPassword,
  dataError,
  // getDataProducts,
  // pagination,
};

// const { pagination } = require('../utils/utils');
const { getAllData } = require('../db-data/sql');
const { dataError } = require('../utilsFunc/utils');

module.exports = {
  // eslint-disable-next-line no-unused-vars
  getUsers: (req, resp, next) => {
    // console.log(req);
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const host = req.get('host');
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const table = '';
    // console.log(req.user.roles);

    getAllData('users')
      .then((result) => {
        if (!req.headers.authorization) {
          return dataError(!req.headers.authorization, resp);
        }
        const totalRec = result.length;
        if (totalRec > 0) {
          let numPages = Math.ceil(totalRec / limit);
          if (totalRec % limit > 0) {
            numPages += 1;
          }
          // const resultsFinal = {};
          // const link = `<https://${host}/users?page=1&limit=${limit}>; rel="first",<https://${host}/users?page=${page}&limit=${limit}>; rel="last"`;
          const resultsFinal = {};
          resultsFinal.result = result.slice(startIndex, endIndex);

          if (endIndex < result.length) {
            resultsFinal.next = `<http://${host}/${table}?page=${page + 1}&limit=${limit}>; rel="next"`;
            // const link = link.concat(resultsFinal.next);
          }
          if (startIndex > 0) {
            resultsFinal.previous = `<http://${host}/${table}?page=${page - 1}&limit=${limit}>; rel="prev",`;
          }
          resultsFinal.first = `<http://${host}/${table}?page=1&limit=${limit}>; rel="first"`;
          resultsFinal.last = `<http://${host}/${table}?page=${numPages}&limit=${limit}>; rel="last"`;
          resp.header('link', `${resultsFinal.first} ${resultsFinal.previous} ${resultsFinal.next} ${resultsFinal.last}`);
          // console.log(resultsFinal.result);
          const resultarray = resultsFinal.result;
          const arrayData = [];
          resultarray.forEach((element) => {
            // console.log(element);
            const admin = !!(element.roles);
            // const email = element.email;
            const elementproduct = {
              _id: (element._id).toString(),
              email: element.email,
              password: element.password,
              roles: { admin },
            };
            // console.log(arrayData);
            arrayData.push(
              elementproduct,
            );
            return arrayData;
          });
          return resp.status(200).send(arrayData);
        }
      })
      .catch((error) => {
        console.error(error);
        resp.status(404).send({ message: 'Not Data Found' });
      });
  },
};

const { getAllData } = require('../db-data/sql');
const { dataError } = require('../utilsFunc/utils');
const { getDataByKeyword } = require('../db-data/sql');

module.exports = {
  // eslint-disable-next-line no-unused-vars
  getOrders: (req, resp, next) => {
    // console.log(req);
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const host = req.get('host');
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const table = '';
    // console.log(req.user.roles);

    getAllData('orders')
      .then((result) => {
        // console.log(result);
        if (!req.headers.authorization) {
          return dataError(!req.headers.authorization, resp);
        }
        const totalRec = result.length;
        // console.log(totalRec);
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
          //   console.log(resultsFinal);

          const resultarray = resultsFinal.result;
          // console.log(resultarray);
          // const arrayData = [];
          const arrPromisesOrders = resultarray.map((element) => {
            // console.log(element);
            const orderRegister = {
              // eslint-disable-next-line no-undef
              _id: (element._id).toString(),
              userId: (element.userId).toString(),
              client: element.client,
              status: element.status,
              dateEntry: element.dateEntry,
              dateProcessed: element.dateProcessed,
            };
            // arrayData.push(orderRegister);
            // });
            // console.log(orderRegister);
            return getDataByKeyword('ordersDetails', 'orderId', element._id)
              .then((order) => {
                // console.log(order)
                const arrPromisesProductsOrder = order.reduce((accumulator, currentValue) => {
                  accumulator.push(getDataByKeyword('products', '_id', currentValue.productId));
                  // console.log(newOrderProduct);
                  // console.log(accumulator);
                  return accumulator;
                }, []);

                // console.log(product)
                return Promise.all(arrPromisesProductsOrder)
                  .then((productsOrder) => [productsOrder, order]);

                // console.log(arrayData);
              })
              .then(([productInfo, order]) => {
                // const productInfo = response[0];
                // const order = response[1];
                // console.log(productInfo);
                orderRegister.products = productInfo.flat().map((element) => {
                  //  console.log(element)
                  // eslint-disable-next-line no-param-reassign
                  element._id = (element._id).toString();
                  // console.log({ product: element })
                  return { product: element };
                });
                // console.log(orderRegister.products);
                orderRegister.products.forEach((currentValue, index) => {
                  // eslint-disable-next-line no-param-reassign
                  currentValue.qty = order[index].qty;
                });
                // TODO aqui se ve la lista
                // console.log(orderRegister);
                return orderRegister;
                // resultarray.forEach((element) => arrayData.push(orderRegister));
                // resp.status(200).send(arrayData);
              })
              .catch(() => {
                // console.log(error);
              });
            // console.log(orderRegister)
          });
          // console.log(arrPromisesOrders);

          Promise.all(arrPromisesOrders)
            .then((response) => {
              // console.log(response);
              resp.status(200).send(response);
            });
          // console.log(arrayData)
          // return arrayData;
          // return
        }
      })
      .catch((error) => {
        console.error(error);
        resp.status(404).send({ message: 'Not Data Found' });
      });
  },
};

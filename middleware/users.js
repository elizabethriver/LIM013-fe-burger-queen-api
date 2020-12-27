// const { pagination } = require('../utils/utils');
// const { getAllData, getDataByKeyword } = require('../db-data/');

// module.exports = {
//   getData: (req, resp, next, table) => {
//     const { page, limit } = req.query;
//     const pages = Number(page);
//     const limits = Number(limit);
//     const host = req.get('host');
//     getAllData(table)
//       .then((result) => {
//         const response = pagination(pages, limits, result, table, host);
//         resp.header('link', response.link);
//         if (response.list) {
//           const jsonUserResp = response.list.map((x) => {
//             const role = (x.rolesAdmin) || false;
//             const id = (!x._id) ? 0 : (x._id).toString();
//             return {
//               _id: id,
//               email: x.email,
//               roles: { admin: role },
//             };
//           });
//           // eslint-disable-next-line array-callback-return
//           const jsonProductResp = response.list.map((x) => {
//           // eslint-disable-next-line no-param-reassign
//             x._id = (!x._id) ? 0 : (x._id).toString();
//             return x;
//           });

//           const variable = response.list.map((order) => getDataByKeyword('orders_products', 'orderId', order._id)
//             .then((array) => {
//               const arrayOrder = array.map((element) => getDataByKeyword('products', '_id', element.productId)
//                 .then((product) => ({
//                   qty: element.qty,
//                   product: product[0],
//                 })));
//               return Promise.all(arrayOrder)
//                 .then((producto) => {
//                   order.products = producto;
//                   return order;
//                 // return resp.status(200).send(order);
//                 });
//             }));
//           switch (table) {
//             case 'users':
//               return resp.status(200).send(jsonUserResp);
//             case 'products':
//               return resp.status(200).send(jsonProductResp);
//             // case 'orders':
//             case 'orders':
//               return Promise.all(variable).then((result) => {
//                 resp.status(200).send(result);
//               });

//             default:
//               break;
//           }
//         }
//         return resp.status(404).send('Page not found');
//       });
//   },
// };
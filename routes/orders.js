/* eslint-disable no-tabs */
const e = require('cors');
const { requireAuth } = require('../middleware/auth');
const {
  // eslint-disable-next-line max-len
  postingData,
  getDataByKeywordPost,
  getDataByKeyword,
  updateDataByKeyword,
  deleteData,
} = require('../db-data/sql');
const { dataError } = require('../utilsFunc/utils');
/** @module orders */
module.exports = (app, nextMain) => {
  /**
	 * @name GET /orders
	 * @description Lista órdenes
	 * @path {GET} /orders
	 * @query {String} [page=1] Página del listado a consultar
	 // eslint-disable-next-line no-tabs
	 * @query {String} [limit=10] Cantitad de elementos por página
	 * @header {Object} link Parámetros de paginación
	 * @header {String} link.first Link a la primera página
	 * @header {String} link.prev Link a la página anterior
	 * @header {String} link.next Link a la página siguiente
	 * @header {String} link.last Link a la última página
	 * @auth Requiere `token` de autenticación
	 * @response {Array} orders
	 * @response {String} orders[]._id Id
	 * @response {String} orders[].userId Id usuaria que creó la orden
	 * @response {String} orders[].client Clienta para quien se creó la orden
	 * @response {Array} orders[].products Productos
	 * @response {Object} orders[].products[] Producto
	 * @response {Number} orders[].products[].qty Cantidad
	 * @response {Object} orders[].products[].product Producto
	 * @response {String} orders[].status Estado: `pending`, `canceled`, `delivering` o `delivered`
	 * @response {Date} orders[].dateEntry Fecha de creación
	 * @response {Date} [orders[].dateProcessed] Fecha de cambio de `status` a `delivered`
	 * @code {200} si la autenticación es correcta
	 * @code {401} si no hay cabecera de autenticación
	 */
  app.get('/orders', requireAuth, (_req, resp, _next) => {
    resp.jon({
      mensaje: 'Lista de ordenes',
    });
  });

  /**
	 * @name GET /orders/:orderId
	 * @description Obtiene los datos de una orden especifico
	 * @path {GET} /orders/:orderId
	 * @params {String} :orderId `id` de la orden a consultar
	 * @auth Requiere `token` de autenticación
	 * @response {Object} order
	 * @response {String} order._id Id
	 * @response {String} order.userId Id usuaria que creó la orden
	 * @response {String} order.client Clienta para quien se creó la orden
	 * @response {Array} order.products Productos
	 * @response {Object} order.products[] Producto
	 * @response {Number} order.products[].qty Cantidad
	 * @response {Object} order.products[].product Producto
	 * @response {String} order.status Estado: `pending`, `canceled`, `delivering` o `delivered`
	 * @response {Date} order.dateEntry Fecha de creación
	 * @response {Date} [order.dateProcessed] Fecha de cambio de `status` a `delivered`
	 * @code {200} si la autenticación es correcta
	 * @code {401} si no hay cabecera de autenticación
	 * @code {404} si la orden con `orderId` indicado no existe
	 */
  app.get('/orders/:orderId', requireAuth, (_req, resp, _next) => {
    resp.jon({
      mensaje: 'Obtiene los datos de una orden especifico',
    });
  });

  /**
	 * @name POST /orders
	 * @description Crea una nueva orden
	 * @path {POST} /orders
	 * @auth Requiere `token` de autenticación
	 * @body {String} userId Id usuaria que creó la orden
	 * @body {String} client Clienta para quien se creó la orden
	 * @body {Array} products Productos
	 * @body {Object} products[] Producto
	 * @body {String} products[].productId Id de un producto
	 * @body {Number} products[].qty Cantidad de ese producto en la orden
	 * @response {Object} order
	 * @response {String} order._id Id
	 * @response {String} order.userId Id usuaria que creó la orden
	 * @response {String} order.client Clienta para quien se creó la orden
	 * @response {Array} order.products Productos
	 * @response {Object} order.products[] Producto
	 * @response {Number} order.products[].qty Cantidad
	 * @response {Object} order.products[].product Producto
	 * @response {String} order.status Estado: `pending`, `canceled`, `delivering` o `delivered`
	 * @response {Date} order.dateEntry Fecha de creación
	 * @response {Date} [order.dateProcessed] Fecha de cambio de `status` a `delivered`
	 * @code {200} si la autenticación es correcta
	 * @code {400} no se indica `userId` o se intenta crear una orden sin productos
	 * @code {401} si no hay cabecera de autenticación
	 */
  app.post('/orders', requireAuth, (req, resp, _next) => {
    const { userId, client, products } = req.body;
    // console.log({
    //   userId, client, products,
    // });
    // console.log(req)
    // const isAdmin = req.user.roles === 1;
    // console.log(isAdmin)
    // // eslint-disable-next-line max-len
    // if (req.user.roles !== 1) {
    //   return resp.status(403).send({ message: 'You do not have admin permissions' }).end();
    // }
    if (!req.headers.authorization) {
      return dataError(!req.headers.authorization, resp);
    }
    if (!userId || !products) {
      return resp
        .status(400)
        .send({ message: 'userId or Products empty' })
        .end();
    }
    // eslint-disable-next-line no-restricted-globals
    // if (isNaN(products.qyt) || products.qyt === undefined) {
    //   return resp
    //     .status(400)
    //     .send({ message: 'Quantity have to be a number' })
    //     .end();
    // }
    const date = new Date();
    const orderRegister = {
      // eslint-disable-next-line no-undef
      // _id: result.insertId,
      userId: userId.toString(),
      client,
      status: 'pending',
      dateEntry: `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`,
      dateProcessed: `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`,
    };
    // console.log(orderRegister);
    postingData('orders', orderRegister)
      .then((result) => {
        // console.log(products);
        products.forEach((element) => {
          const newOrderProduct = {
            orderId: result.insertId,
            qty: element.qty,
            productId: element.productId,
          };
          // console.log(newOrderProduct);
          postingData('ordersDetails', newOrderProduct).then(() => {
            // console.log(result);
          });
          const dataProduct = products.map((element) => getDataByKeyword('products', '_id', element.productId));
          // console.log(dataProduct);
          Promise.all(dataProduct)
            .then((values) => {
              // console.log(values);
              orderRegister._id = result.insertId.toString();
              orderRegister.products = values.flat().map((element) => {
                // eslint-disable-next-line no-param-reassign
                element._id = (element._id).toString();
                return { product: element };
              });
              // console.log(orderRegister.products);
              orderRegister.products.forEach((product, index) => {
                // eslint-disable-next-line no-param-reassign
                product.qty = products[index].qty;
                // console.log(product.qty);
              });
              // console.log(orderRegister)
              resp.status(200).send(orderRegister).end();
            })
            .catch(() => {
              // console.log(err);
            });
        });
      })
      .catch(() => {
        // console.log(err);
      });
  });

  /**
	 * @name PUT /orders
	 * @description Modifica una orden
	 * @path {PUT} /products
	 * @params {String} :orderId `id` de la orden
	 * @auth Requiere `token` de autenticación
	 * @body {String} [userId] Id usuaria que creó la orden
	 * @body {String} [client] Clienta para quien se creó la orden
	 * @body {Array} [products] Productos
	 * @body {Object} products[] Producto
	 * @body {String} products[].productId Id de un producto
	 * @body {Number} products[].qty Cantidad de ese producto en la orden
	 * @body {String} [status] Estado: `pending`, `canceled`, `delivering` o `delivered`
	 * @response {Object} order
	 * @response {String} order._id Id
	 * @response {String} order.userId Id usuaria que creó la orden
	 * @response {Array} order.products Productos
	 * @response {Object} order.products[] Producto
	 * @response {Number} order.products[].qty Cantidad
	 * @response {Object} order.products[].product Producto
	 * @response {String} order.status Estado: `pending`, `canceled`, `delivering` o `delivered`
	 * @response {Date} order.dateEntry Fecha de creación
	 * @response {Date} [order.dateProcessed] Fecha de cambio de `status` a `delivered`
	 * @code {200} si la autenticación es correcta
	 * @code {400} si no se indican ninguna propiedad a modificar o la propiedad `status` no es valida
	 * @code {401} si no hay cabecera de autenticación
	 * @code {404} si la orderId con `orderId` indicado no existe
	 */
  app.put('/orders/:orderId', requireAuth, (req, resp, _next) => {
    const {
      userId, client, products, status,
    } = req.body;
    // console.log({
    //   userId, client, products, status,
    // });
    if (!req.headers.authorization) {
      return dataError(!req.headers.authorization, resp);
    }
    if (!userId || !products || !client) {
      return resp
        .status(400)
        .send({ message: 'Not properties to change' })
        .end();
    }
    // eslint-disable-next-line no-restricted-globals
    // if (isNaN(products.qyt)) {
    //   return resp.status(400).send({ message: 'Quantity have to be a number' }).end();
    // }
    const statusEvaluated = [
      'pending',
      'canceled',
      'delivering',
      'delivered',
    ].includes(status);
    // console.log(statusEvaluated)
    if (statusEvaluated === false) {
      return resp.status(400).send({ message: 'status is not valid' }).end();
    }

    const date = new Date();
    const updatedDetailsOrder = {
      ...(userId && { userId }),
      ...(client && { client }),
      ...(status && { status }),
      ...(status === 'delivered' && {
        dateProcessed: `${date.getFullYear()}-${
          date.getMonth() + 1
        }-${date.getDate()}`,
      }),
    };
    // console.log(updatedDetailsProductos);
    // console.log(req.params.orderId);
    getDataByKeyword('orders', '_id', req.params.orderId)
      .then(() => {
        // updatedDetailsOrder.dateEntry = result[0].dateEntry;
        // console.log(updatedDetailsOrder);
        // console.log(result);
        updateDataByKeyword(
          'orders',
          updatedDetailsOrder,
          '_id',
          req.params.orderId,
        )
          .then(() => {
            // console.log(!products);
            if (products) {
              // console.log(products)
              const x = products.reduce((accumulator, currentValue) => {
                const newOrderProduct = {
                  ...((products) && { qty: currentValue.qty, productId: currentValue.productId }),
                };
                // console.log(currentValue.productId);
                // console.log(newOrderProduct)
                accumulator.push(updateDataByKeyword('ordersDetails', newOrderProduct, 'productId', currentValue.productId));
                // console.log(newOrderProduct);
                //  console.log(accumulator);
                return accumulator;
              }, []);
              // console.log(x)
              Promise.all(x)
                .then(() => {
                  // console.log(result);
                  getDataByKeyword('orders', '_id', req.params.orderId)
                    .then((result) => {
                      // console.log(result)
                      updatedDetailsOrder._id = (result[0]._id).toString();
                      getDataByKeyword('ordersDetails', 'orderId', req.params.orderId)
                        .then((result) => {
                          // console.log(result);
                          const dataProduct = result.map((element) => {
                            const productID = element.productId;
                            return getDataByKeyword('products', '_id', productID);
                            // console.log(productID)
                          });
                          // console.log(dataProduct);
                          Promise.all(dataProduct)
                            .then((values) => {
                              // console.log(values);
                              updatedDetailsOrder.products = values.flat().map((element) => {
                                // eslint-disable-next-line no-param-reassign
                                element._id = (element._id).toString();
                                return { product: element };
                              });
                              // console.log(updatedDetailsOrder.products);
                              updatedDetailsOrder.products.forEach((currentValue, index) => {
                                // eslint-disable-next-line no-param-reassign
                                currentValue.qty = products[index].qty;
                              });
                              // console.log(updatedDetailsOrder);
                              return resp.status(200).send(updatedDetailsOrder);
                            })
                            .catch(() => {
                              // console.log(err);
                            });
                        })
                        .catch(() => {
                          // console.log(err);
                        });
                    })
                    .catch(() => {
                      // console.log(err);
                    });
                })
                .catch(() => {
                  // console.log(err);
                });
              // console.log(x);
            }
          })
          .catch(() => {
            // console.error(err);
          });
      })
      .catch(() => {
        // console.error(err);
        resp.status(404).send({ message: 'The order with Id does not exists.' }).end();
      });
  });

  /**
	 * @name DELETE /orders
	 * @description Elimina una orden
	 * @path {DELETE} /orders
	 * @params {String} :orderId `id` del producto
	 * @auth Requiere `token` de autenticación
	 * @response {Object} order
	 * @response {String} order._id Id
	 * @response {String} order.userId Id usuaria que creó la orden
	 * @response {String} order.client Clienta para quien se creó la orden
	 * @response {Array} order.products Productos
	 * @response {Object} order.products[] Producto
	 * @response {Number} order.products[].qty Cantidad
	 * @response {Object} order.products[].product Producto
	 * @response {String} order.status Estado: `pending`, `canceled`, `delivering` o `delivered`
	 * @response {Date} order.dateEntry Fecha de creación
	 * @response {Date} [order.dateProcessed] Fecha de cambio de `status` a `delivered`
	 * @code {200} si la autenticación es correcta
	 * @code {401} si no hay cabecera de autenticación
	 * @code {404} si el producto con `orderId` indicado no existe
	 */
  app.delete('/orders/:orderId', requireAuth, (_req, _resp, _next) => {
    // console.log(reqproducts);
    const keyword = Number(_req.params.orderId);
    // console.log(keyword);

    getDataByKeyword('orders', '_id', keyword)
      .then((result) => {
        if (!_req.headers.authorization) {
          return dataError(!_req.headers.authorization, _resp);
        }
        // console.log(result);
        const orderRegister = {
          // eslint-disable-next-line no-undef
          _id: (result[0]._id).toString(),
          userId: (result[0].userId).toString(),
          client: result[0].client,
          status: result[0].status,
          dateEntry: result[0].dateEntry,
          dateProcessed: result[0].dateEntry,
        };
        console.log(orderRegister);
        getDataByKeyword('ordersDetails', 'orderId', keyword)
          .then((result) => {
            
            console.log(result);
          })
          .catch((err) => {
            console.log(err);
          });
        // deleteData('orders', '_id', keyword)
        //   .then((result) => {
        //     // console.log(result);
        //     // _resp.status(200).send();
        //   })
        //   .catch((err) => {
        //     console.error(err);
        //   });
      }).catch((error) => {
        console.log(error);
        _resp.status(404).send({ message: `Order with ${keyword} id does not exist to delete.` }).end();
      });
  });

  nextMain();
};

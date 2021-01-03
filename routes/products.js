const {
  requireAuth,
  requireAdmin,
} = require('../middleware/auth');

const {
  // eslint-disable-next-line max-len
  postingData, getDataByKeywordPost, getDataByKeyword, updateDataByKeyword, deleteData,
} = require('../db-data/sql');
const { dataError } = require('../utilsFunc/utils');
const { getProducts } = require('../controller/products');

/** @module products */
module.exports = (app, nextMain) => {
  /**
   * @name GET /products
   * @description Lista productos
   * @path {GET} /products
   * @query {String} [page=1] Página del listado a consultar
   * @query {String} [limit=10] Cantitad de elementos por página
   * @header {Object} link Parámetros de paginación
   * @header {String} link.first Link a la primera página
   * @header {String} link.prev Link a la página anterior
   * @header {String} link.next Link a la página siguiente
   * @header {String} link.last Link a la última página
   * @auth Requiere `token` de autenticación
   * @response {Array} products
   * @response {String} products[]._id Id
   * @response {String} products[].name Nombre
   * @response {Number} products[].price Precio
   * @response {URL} products[].image URL a la imagen
   * @response {String} products[].type Tipo/Categoría
   * @response {Date} products[].dateEntry Fecha de creación
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   */
  app.get('/products', requireAuth, getProducts);

  /**
   * @name GET /products/:productId
   * @description Obtiene los datos de un producto especifico
   * @path {GET} /products/:productId
   * @params {String} :productId `id` del producto
   * @auth Requiere `token` de autenticación
   * @response {Object} product
   * @response {String} product._id Id
   * @response {String} product.name Nombre
   * @response {Number} product.price Precio
   * @response {URL} product.image URL a la imagen
   * @response {String} product.type Tipo/Categoría
   * @response {Date} product.dateEntry Fecha de creación
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   * @code {404} si el producto con `productId` indicado no existe
   */
  app.get('/products/:productId', requireAuth, (req, resp, next) => {
    // console.log(req.user);
    const keyword = Number(req.params.productId);
    // console.log(keyword);
    getDataByKeyword('products', 'id', keyword)
      .then((result) => {
        // console.log(result);
        if (!req.headers.authorization) {
          return dataError(!req.headers.authorization, resp);
        }
        // eslint-disable-next-line no-param-reassign
        result[0].id = keyword.toString();
        const dateEntry = (result[0].dateEntry).toString().split('T')[0];
        const productGet = {
          id: result[0].id,
          name: result[0].name,
          price: result[0].price,
          image: result[0].image,
          type: result[0].type,
          dateEntry,
        };
        resp.status(200).send(productGet);
      }).catch(() => {
        // console.log(error);
        resp.status(404).send({ message: `Product with ${keyword} id does not exist.` }).end();
      });
  });

  /**
   * @name POST /products
   * @description Crea un nuevo producto
   * @path {POST} /products
   * @auth Requiere `token` de autenticación y que la usuaria sea **admin**
   * @body {String} name Nombre
   * @body {Number} price Precio
   * @body {String} [imagen]  URL a la imagen
   * @body {String} [type] Tipo/Categoría
   * @response {Object} product
   * @response {String} products._id Id
   * @response {String} product.name Nombre
   * @response {Number} product.price Precio
   * @response {URL} product.image URL a la imagen
   * @response {String} product.type Tipo/Categoría
   * @response {Date} product.dateEntry Fecha de creación
   * @code {200} si la autenticación es correcta
   * @code {400} si no se indican `name` o `price`
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es admin
   * @code {404} si el producto con `productId` indicado no existe
   */
  app.post('/products', requireAdmin, (req, resp, next) => {
    const {
      name, price, image, type,
    } = req.body;
    // console.log({
    //   name, price, image, type,
    // });
    // const isAdmin = req.user.roles === 1;
    // console.log(isAdmin)
    // // eslint-disable-next-line max-len
    // if (req.user.roles !== 1) {
    //   return resp.status(403).send({ message: 'You do not have admin permissions' }).end();
    // }
    if (!name || !price) {
      return resp.status(400).send({ message: 'name or price empty' }).end();
    }
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(price) && price !== undefined) {
      return resp.status(400).send({ message: 'Price have to be a number' }).end();
    }
    getDataByKeywordPost('products', 'name', name)
      .then((result) => {
        // console.log(result);
        if (!req.headers.authorization) {
          return dataError(!req.headers.authorization, resp);
        }
        // console.log(result);
        if (result.length > 0) {
          return resp.status(404).send({ message: 'Products already exists' }).end();
        }

        const date = new Date();
        const productRegister = {
          // id: result.insertId,
          name,
          price,
          image,
          type,
          dateEntry: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
        };
        // console.log(productRegister);
        postingData('products', productRegister)
          .then((result) => {
            const productRegisterSent = {
              id: (result.insertId).toString(),
              ...productRegister,
            };
            // productRegister.id = result.insertId.toString();
            resp.status(200).send(productRegisterSent).end();
          })
          .catch((err) => {
            if (err.code === 'ER_DUP_ENTRY') {
              resp.status(403).end();
            }
          });
      })
      .catch(() => {
        // console.log(error);
      });
  });

  /**
   * @name PUT /products
   * @description Modifica un producto
   * @path {PUT} /products
   * @params {String} :productId `id` del producto
   * @auth Requiere `token` de autenticación y que el usuario sea **admin**
   * @body {String} [name] Nombre
   * @body {Number} [price] Precio
   * @body {String} [imagen]  URL a la imagen
   * @body {String} [type] Tipo/Categoría
   * @response {Object} product
   * @response {String} product._id Id
   * @response {String} product.name Nombre
   * @response {Number} product.price Precio
   * @response {URL} product.image URL a la imagen
   * @response {String} product.type Tipo/Categoría
   * @response {Date} product.dateEntry Fecha de creación
   * @code {200} si la autenticación es correcta
   * @code {400} si no se indican ninguna propiedad a modificar
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es admin
   * @code {404} si el producto con `productId` indicado no existe
   */
  app.put('/products/:productId', requireAdmin, (req, resp, next) => {
    const {
      name, price, image, type,
    } = req.body;
    // console.log(req.params);
    // console.log({
    //   name, price, image, type,
    // });
    const id = Number(req.params.productId);
    // console.log(id);
    if (!name || !price || !image || !type) {
      return resp.status(400).send({ message: 'some values are empty' }).end();
    }
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(price) && price !== undefined) {
      return resp.status(400).send({ message: 'Price have to be a number' }).end();
    }

    const date = new Date();
    const updatedDetailsProductos = {
      ...((name) && { name }),
      ...((price) && { price }),
      ...((image) && { image }),
      ...((type) && { type }),
      dateEntry: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      // eslint-disable-next-line max-len
    };
    // console.log(updatedDetailsProductos);

    getDataByKeyword('products', 'id', id)
      .then(() => {
        if (!req.headers.authorization) {
          return dataError(!req.headers.authorization, resp);
        }
        // console.log(result);

        updateDataByKeyword('products', updatedDetailsProductos, 'id', id)
          .then(() => {
            // console.log(result);
            getDataByKeyword('products', 'name', name)
              .then((product) => {
                // console.log(product);
                // const { admin } = !!(user[0].roles);
                resp.status(200).send(
                  {
                    id: (product[0].id).toString(),
                    ...updatedDetailsProductos,
                  },
                );
              })
              .catch(() => {
              });
          })
          .catch(() => {
          });
      }).catch(() => {
        resp.status(404).send({ message: 'The product with Id does not exists.' }).end();
      });
  });

  /**
   * @name DELETE /products
   * @description Elimina un producto
   * @path {DELETE} /products
   * @params {String} :productId `id` del producto
   * @auth Requiere `token` de autenticación y que el usuario sea **admin**
   * @response {Object} product
   * @response {String} product._id Id
   * @response {String} product.name Nombre
   * @response {Number} product.price Precio
   * @response {URL} product.image URL a la imagen
   * @response {String} product.type Tipo/Categoría
   * @response {Date} product.dateEntry Fecha de creación
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es ni admin
   * @code {404} si el producto con `productId` indicado no existe
   */
  app.delete('/products/:productId', requireAdmin, (req, resp, next) => {
    // console.log(reqproducts);
    const keyword = Number(req.params.productId);
    // console.log(keyword);

    getDataByKeyword('products', 'id', keyword)
      .then((result) => {
        if (!req.headers.authorization) {
          return dataError(!req.headers.authorization, resp);
        }
        const dateEntry = (result[0].dateEntry).toString().split('T')[0];
        const productGet = {
          id: (result[0].id).toString(),
          name: result[0].name,
          price: result[0].price,
          image: result[0].image,
          type: result[0].type,
          dateEntry,
        };

        deleteData('products', 'id', keyword)
          .then(() => {
            resp.status(200).send(productGet);
          })
          .catch((err) => {
            console.error(err);
          });
      }).catch(() => {
        // console.log(error);
        resp.status(404).send({ message: `Product with ${keyword} id does not exist to delete.` }).end();
      });
  });

  nextMain();
};

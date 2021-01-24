const bcrypt = require('bcrypt');
const isNumber = require('is-number');
const {
  requireAuth,
  requireAdmin,
} = require('../middleware/auth');
// const pool = require('../db-data/modelo');

const {
  getUsers,
} = require('../controller/users');

const {
  // eslint-disable-next-line max-len
  postingData, findAdminExist, postData, getDataByKeyword, updateDataByKeyword, deleteData,
} = require('../controller/sql');
// const users = require('../controller/users');

const { validateEmail, checkPassword, dataError } = require('../utilsFunc/utils');

const initAdminUser = (app, next) => {
  const { adminEmail, adminPassword } = app.get('config');
  // console.log({ adminEmail, adminPassword });
  if (!adminEmail || !adminPassword) {
    return next();
  }

  const adminUser = {
    _id: Number('1001'),
    email: adminEmail,
    password: bcrypt.hashSync(adminPassword, 10),
    roles: { admin: true },
  };
  // console.log(adminEmail);
  // TODO: crear usuaria admin
  // getAllData('users')
  //   .then(() => {
  //     console.log(user);
  //     next();
  //   })
  //   .catch(() => {
  //     console.log(error);
  //     postingData('users', adminUser)
  //       .then(() => {
  //         console.log(result);
  //         next();
  //       })
  //       .catch(() => {
  //         console.log(err);
  //       });
  //   });
  const keyword = 'roles';

  findAdminExist('users', keyword, 1)
    .then((length) => {
      // console.log(length)
      if (length === 0) {
        postData('users', 'email', 'password', 'roles', adminUser.email, adminUser.password, adminUser.roles.admin)
          .then(() => {
            // console.log('user admin created');
            // console.log(result);
            next();
          })
          .catch(() => {
            // console.log( 'posdata', error);
          });
      } else {
        next();
      }
    })
    .catch(() => {
      // console.error(error);
    });
};

/*
 * Diagrama de flujo de una aplicación y petición en node - express :
 *
 * request  -> middleware1 -> middleware2 -> route
 *                                             |
 * response <- middleware4 <- middleware3   <---
 *
 * la gracia es que la petición va pasando por cada una de las funciones
 * intermedias o "middlewares" hasta llegar a la función de la ruta, luego esa
 * función genera la respuesta y esta pasa nuevamente por otras funciones
 * intermedias hasta responder finalmente a la usuaria.
 *
 * Un ejemplo de middleware podría ser una función que verifique que una usuaria
 * está realmente registrado en la aplicación y que tiene permisos para usar la
 * ruta. O también un middleware de traducción, que cambie la respuesta
 * dependiendo del idioma de la usuaria.
 *
 * Es por lo anterior que siempre veremos los argumentos request, response y
 * next en nuestros middlewares y rutas. Cada una de estas funciones tendrá
 * la oportunidad de acceder a la consulta (request) y hacerse cargo de enviar
 * una respuesta (rompiendo la cadena), o delegar la consulta a la siguiente
 * función en la cadena (invocando next). De esta forma, la petición (request)
 * va pasando a través de las funciones, así como también la respuesta
 * (response).
 */

/** @module users */
module.exports = (app, next) => {
  /**
   * @name GET /users
   * @description Lista usuarias
   * @path {GET} /users
   * @query {String} [page=1] Página del listado a consultar
   * @query {String} [limit=10] Cantitad de elementos por página
   * @header {Object} link Parámetros de paginación
   * @header {String} link.first Link a la primera página
   * @header {String} link.prev Link a la página anterior
   * @header {String} link.next Link a la página siguiente
   * @header {String} link.last Link a la última página
   * @auth Requiere `token` de autenticación y que la usuaria sea **admin**
   * @response {Array} users
   * @response {String} users[]._id
   * @response {Object} users[].email
   * @response {Object} users[].roles
   * @response {Boolean} users[].roles.admin
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es ni admin
   */
  app.get('/users', requireAdmin, getUsers);

  /**
   * @name GET /users/:uid
   * @description Obtiene información de una usuaria
   * @path {GET} /users/:uid
   * @params {String} :uid `id` o `email` de la usuaria a consultar
   * @auth Requiere `token` de autenticación y que la usuaria sea **admin** o la usuaria a consultar
   * @response {Object} user
   * @response {String} user._id
   * @response {Object} user.email
   * @response {Object} user.roles
   * @response {Boolean} user.roles.admin
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es ni admin o la misma usuaria
   * @code {404} si la usuaria solicitada no existe
   */
  app.get('/users/:uid', requireAdmin && requireAuth, (req, resp) => {
    // console.log(req.user);
    const keyword = (isNumber(req.params.uid)) ? '_id' : 'email';
    // console.log(keyword);
    const isAdmin = req.user.roles === 1;
    // // console.log(isAdmin);
    // // eslint-disable-next-line max-len
    // eslint-disable-next-line max-len
    const canEdit = (req.params.uid.includes('@')) ? (req.user.email === req.params.uid) : (req.user._id === Number(req.params.uid));
    // console.log(canEdit);
    if (!(canEdit || isAdmin)) {
      return resp.status(403).send({ message: 'You do not have admin permissions' });
    }

    getDataByKeyword('users', keyword, req.params.uid)
      .then((result) => {
        // console.log(result);
        if (!req.headers.authorization) {
          return dataError(!req.headers.authorization, resp);
        }
        const admin = !!(result[0].roles);
        const userGet = {
          _id: (result[0]._id).toString(),
          email: result[0].email,
          roles: { admin },
        };
        // console.log(userGet);
        // userGet.email = result[0].email;
        // userGet.roles = { admin };
        resp.status(200).send(userGet);
      }).catch(() => {
        // console.log(error);
        resp.status(404).send({ message: `User with ${keyword} does not exist.` }).end();
      });
  });
  /**
   * @name POST /users
   * @description Crea una usuaria
   * @path {POST} /users
   * @body {String} email Correo
   * @body {String} password Contraseña
   * @body {Object} [roles]
   * @body {Boolean} [roles.admin]
   * @auth Requiere `token` de autenticación y que la usuaria sea **admin**
   * @response {Object} user
   * @response {String} user._id
   * @response {Object} user.email
   * @response {Object} user.roles
   * @response {Boolean} user.roles.admin
   * @code {200} si la autenticación es correcta
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si ya existe usuaria con ese `email`
   */
  // eslint-disable-next-line no-unused-vars
  app.post('/users', requireAdmin, (req, resp, next) => {
    // console.log(req.user);
    // console.log(req.body);
    const { email, password, roles } = req.body;
    // console.log(`otro texot ${{ email, password, roles }}`);
    // const admin = !!(roles);
    // console.log('hola estoy aqui: ', admin)
    const validateInput = validateEmail(email) && checkPassword(password);

    // console.log(validateInput);
    if (!(email || password) || !validateInput) {
      return resp.status(400).send({ message: 'email or passwoord empty or not validated' }).end();
    }
    if (!req.headers.authorization) {
      return dataError(!req.headers.authorization, resp);
    }
    // if (!validateInput) {
    //   return resp.status(400).send({ mensaje: 'Invalid email or password' });
    // }

    const role = roles ? roles.admin : false;
    // console.log(role)
    const user = {
      email,
      password: bcrypt.hashSync(password, 10),
      roles: role,
    };
    getDataByKeyword('users', 'email', email)
      .then(() => resp.status(403).send({ message: 'Email already exists' }).end())
      .catch(() => {
        // console.log(error);
        postingData('users', user)
          .then((result) => resp.status(200).send(
            {
              _id: (result.insertId).toString(),
              email: user.email,
              roles: { admin: user.roles },
            },
          ));
      });
  });

  /**
   * @name PUT /users
   * @description Modifica una usuaria
   * @params {String} :uid `id` o `email` de la usuaria a modificar
   * @path {PUT} /users
   * @body {String} email Correo
   * @body {String} password Contraseña
   * @body {Object} [roles]
   * @body {Boolean} [roles.admin]
   * @auth Requiere `token` de autenticación y que la usuaria sea **admin** o la usuaria a modificar
   * @response {Object} user
   * @response {String} user._id
   * @response {Object} user.email
   * @response {Object} user.roles
   * @response {Boolean} user.roles.admin
   * @code {200} si la autenticación es correcta
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es ni admin o la misma usuaria
   * @code {403} una usuaria no admin intenta de modificar sus `roles`
   * @code {404} si la usuaria solicitada no existe
   */
  // eslint-disable-next-line no-unused-vars
  app.put('/users/:uid', requireAdmin && requireAuth, (req, resp, next) => {
    // console.log(req.user)
    // console.log(req.body)
    const { email, password, roles } = req.body;
    // console.log(req.params);
    // console.log({ email, password, roles });
    const keyword = (isNumber(req.params.uid)) ? '_id' : 'email';
    const isAdmin = req.user.roles === 1;
    const cantEditRole = (!!roles && !isAdmin);
    const validateEmailResp = validateEmail(email);
    const validatePasswordResp = checkPassword(password);
    const role = roles ? roles.admin : false;

    // console.log(cantEditRole)
    // eslint-disable-next-line max-len
    const canEdit = (req.params.uid.includes('@')) ? (req.user.email === req.params.uid) : (req.user._id === Number(req.params.uid));
    // console.log(canEdit);
    if (!(canEdit || isAdmin) || cantEditRole) {
      return resp.status(403).send({ message: 'You do not have admin permissions' });
    }

    // console.log(keyword);
    if (!email || !password) {
      return resp.status(400).send({ message: 'email or passwoord empty' }).end();
    }

    // console.log(role);
    const updatedDetails = {
      ...((email && validateEmailResp) && { email, roles: role }),
      // eslint-disable-next-line max-len
      ...((password && validatePasswordResp) && { password: bcrypt.hashSync(password, 10), roles: role }),
    };
    // console.log(updatedDetails);

    getDataByKeyword('users', keyword, req.params.uid)
      .then(() => {
        if (!req.headers.authorization) {
          return dataError(!req.headers.authorization, resp);
        }
        if (!(email || password || roles)) {
          // eslint-disable-next-line max-len
          return resp.status(400);
        }
        // console.log(result);

        updateDataByKeyword('users', updatedDetails, keyword, req.params.uid)
          .then(() => getDataByKeyword('users', 'email', email)
            .then((user) => resp.status(200).send(
              {
                _id: (user[0]._id).toString(),
                email: user[0].email,
                roles: { admin: !!(user[0].roles) },
              },
            ))
            .catch(() => {
            }))
          .catch(() => {
          });
      }).catch(() => resp.status(404).send({ message: `User with ${keyword} does not exist.` }));
  });
  /**
   * @name DELETE /users
   * @description Elimina una usuaria
   * @params {String} :uid `id` o `email` de la usuaria a modificar
   * @path {DELETE} /users
   * @auth Requiere `token` de autenticación y que la usuaria sea **admin** o la usuaria a eliminar
   * @response {Object} user
   * @response {String} user._id
   * @response {Object} user.email
   * @response {Object} user.roles
   * @response {Boolean} user.roles.admin
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es ni admin o la misma usuaria
   * @code {404} si la usuaria solicitada no existe
   */
  // eslint-disable-next-line no-unused-vars
  app.delete('/users/:uid', requireAdmin && requireAuth, (req, resp, next) => {
    // console.log(req);
    const keyword = (isNumber(req.params.uid)) ? '_id' : 'email';
    // console.log(keyword);
    const isAdmin = req.user.roles === 1;
    // console.log(isAdmin);
    // eslint-disable-next-line max-len
    const canEdit = (req.params.uid.includes('@')) ? (req.user.email === req.params.uid) : (req.user.id === Number(req.params.uid));
    // console.log(canEdit);
    if (!(canEdit || isAdmin)) {
      return resp.status(403).send({ message: 'You do not have admin permissions' });
    }

    // const userDeleted = {
    //   id: req.params.uid,
    // };

    getDataByKeyword('users', keyword, req.params.uid)
      .then((result) => {
        if (!req.headers.authorization) {
          return dataError(!req.headers.authorization, resp);
        }
        // const admin = !!(result[0].admin);
        // userDeleted.email = result[0].email;
        // userDeleted.roles = { admin };
        const admin = !!(result[0].roles);
        const userGet = {
          _id: (result[0]._id).toString(),
          email: result[0].email,
          roles: { admin },
        };

        deleteData('users', keyword, req.params.uid)
          .then(() => {
            resp.status(200).send(userGet);
          })
          .catch((err) => {
            console.error(err);
          });
      }).catch(() => {
        // console.log(error);
        resp.status(404).send({ message: `User with ${keyword} does not exist to delete.` }).end();
      });
  });

  initAdminUser(app, next);
};

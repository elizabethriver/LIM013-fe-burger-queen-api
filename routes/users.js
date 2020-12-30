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
  getDataByKeywordPost, postDataIn, postData, findAdminExist, getDataByKeyword, updateDataByKeyword, deleteData,
} = require('../db-data/sql');
// const users = require('../controller/users');

const { validateEmail, checkPassword, dataError } = require('../utilsFunc/utils');

const initAdminUser = (app, next) => {
  const { adminEmail, adminPassword } = app.get('config');
  // console.log({ adminEmail, adminPassword });
  if (!adminEmail || !adminPassword) {
    return next();
  }

  const adminUser = {
    email: adminEmail,
    password: bcrypt.hashSync(adminPassword, 10),
    roles: { admin: true },
  };
  // console.log(adminUser);
  // TODO: crear usuaria admin
  const keyword = 'roles';

  findAdminExist('users', keyword, 1)
    .then((length) => {
      if (length === 0) {
        // eslint-disable-next-line no-unused-expressions
        postData('users', 'email', 'password', 'roles', adminUser.email, adminUser.password, adminUser.roles.admin)
          .then(() => {
            // console.log('user admin created');
            // console.log(result);
            next();
          })
          .catch(() => {
            // console.log(error);
          });
        // try {
        // // eslint-disable-next-line max-len
        // eslint-disable-next-line max-len
        //   const sql = `INSERT INTO users (email, password, admin) VALUES ('${adminUser.email}', '${adminUser.password}', ${adminUser.roles.admin})`;
        //   pool.query(sql, (err, result) => {
        //     // console.log(pool);
        //     if (err) { throw err; }
        //     // console.log('user admin created');
        //   });
        // } finally {
        //   next();
        // }
      } else {
        next();
      }
    })
    .catch((error) => {
      console.error(error);
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
  app.get('/users/:uid', requireAuth, (req, resp) => {
    // console.log(req.user);
    const keyword = (isNumber(req.params.uid)) ? 'id' : 'email';
    // console.log(keyword);
    const isAdmin = req.user.roles === 1;
    // // console.log(isAdmin);
    // // eslint-disable-next-line max-len
    // eslint-disable-next-line max-len
    const canEdit = (req.params.uid.includes('@')) ? (req.user.email === req.params.uid) : (req.user.id === Number(req.params.uid));
    // console.log(canEdit);
    if (!(canEdit || isAdmin)) {
      return resp.status(403).send({ message: 'You do not have admin permissions' });
    }

    getDataByKeyword('users', keyword, req.params.uid)
      .then((result) => {
        // console.log(result);
        if (!req.params.uid) {
          return dataError(!req.headers.authorization, resp);
        }
        const admin = !!(result[0].roles);
        const userGet = {
          id: result[0].id,
          email: result[0].email,
          roles: { admin },
        };
        // console.log(userGet);
        // userGet.email = result[0].email;
        // userGet.roles = { admin };
        resp.status(200).send(userGet);
      }).catch(() => {
        // console.log(error);
        resp.status(404).send({ message: `El usuario con ${keyword} no existe para eliminar.` }).end();
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
  app.post('/users', requireAdmin, (req, resp, next) => {
    // console.log(req.user);
    // console.log(req.body);
    const { email, password, roles } = req.body;
    // console.log(`otro texot ${{ email, password, roles }}`);
    // const admin = !!(roles);
    const user = {
      email,
      password: bcrypt.hashSync(password, 10),
      roles: roles.admin,
    };
    // console.log(user);
    if (!email || !password) {
      return resp.status(400).send({ message: 'email or passwoord empty' }).end();
    }
    getDataByKeywordPost('users', 'email', user.email)
      .then((result) => {
        // console.log(result);
        if (!req.headers.authorization) {
          return dataError(!req.headers.authorization, resp);
        }
        // console.log(result);
        if (result.length > 0) {
          return resp.status(403).send({ message: 'Email already exists' }).end();
        }
        // console.log(result);
        postDataIn('users', 'email', 'password', 'roles', user.email, user.password, user.roles)
          .then((result) => {
            // console.log(result);
            // console.log('user registered');
            const userRegister = {
              id: result.insertId,
              email: user.email,
              roles: { admin: user.roles },
            };
            // return next(200);
            resp.status(200).send(userRegister).end();
          })
          .catch((err) => {
            if (err.code === 'ER_DUP_ENTRY') {
              // console.log('User already exists');
              resp.status(403).end();
            }
          });
      })
      .catch(() => {
        // console.log(error);
      });

    // try {
    //   pool.query(`SELECT * FROM users where email='${user.email}'`, (error, result) => {
    //     if (error) { throw error; }
    //     // console.log(result);
    //     if (result.length > 0) {
    //       return resp.status(403).send({ message: 'Email already exists' }).end();
    //     }
    // eslint-disable-next-line max-len
    //     const sql = `INSERT INTO users (email, password, admin) VALUES ('${user.email}', '${user.password}', ${user.admin})`;
    //     pool.query(sql, (err, result) => {
    //       if (err) {
    //         if (err.code === 'ER_DUP_ENTRY') {
    //           // console.log('User already exists');
    //           return resp.status(403).end();
    //         }
    //       } else {
    //         // console.log('user registered');
    //         const userRegister = {
    //           id: result.insertId,
    //           email: user.email,
    //           admin: { roles: user.admin },
    //         };
    //           // return next(200);
    //         return resp.status(200).json(userRegister).end();
    //       }
    //     });
    //   });
    // } catch (error) {
    //   next(404);
    // }
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
  app.put('/users/:uid', requireAdmin && requireAuth, (req, resp, next) => {
    // console.log(req.user)
    // console.log(req.body)
    const { email, password, roles } = req.body;
    // console.log(req.params);
    // console.log({ email, password, roles });
    const keyword = (isNumber(req.params.uid)) ? 'id' : 'email';
    const isAdmin = req.user.roles === 1;
    // eslint-disable-next-line max-len
    const canEdit = (req.params.uid.includes('@')) ? (req.user.email === req.params.uid) : (req.user.id === Number(req.params.uid));
    // // console.log(canEdit);
    if (!(canEdit || isAdmin)) {
      return resp.status(403).send({ message: 'You do not have admin permissions' });
    }

    // console.log(keyword);
    if (!email || !password) {
      return resp.status(400).send({ message: 'email or passwoord empty' }).end();
    }

    const validateEmailResp = validateEmail(email);
    const validatePasswordResp = checkPassword(password);
    const role = roles ? roles.admin : false;
    // console.log(role);
    const updatedDetails = {
      ...((email && validateEmailResp) && { email, roles: role }),
      // eslint-disable-next-line max-len
      ...((password && validatePasswordResp) && { password: bcrypt.hashSync(password, 10), roles: role }),
    };
    // console.log(updatedDetails);

    getDataByKeyword('users', keyword, req.params.uid)
      .then(() => {
        if (!req.params.uid) {
          return dataError(!req.headers.authorization, resp);
        }
        // console.log(result);

        updateDataByKeyword('users', updatedDetails, keyword, req.params.uid)
          .then(() => {
            // console.log(result);
            getDataByKeyword('users', 'email', email)
              .then((user) => {
                // console.log(user);
                // const { admin } = !!(user[0].roles);
                resp.status(200).send(
                  {
                    id: user[0].id,
                    email: user[0].email,
                    roles: { admin: !!(user[0].roles) },
                  },
                );
              })
              .catch(() => {
              });
          })
          .catch(() => {
          });
      }).catch(() => {
        resp.status(404).send({ message: `El usuario con ${keyword} no existe.` }).end();
      });
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
  app.delete('/users/:uid', requireAdmin && requireAuth, (req, resp, next) => {
    // console.log(req);
    const keyword = (isNumber(req.params.uid)) ? 'id' : 'email';
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
        if (!req.params.uid) {
          return dataError(!req.headers.authorization, resp);
        }
        // const admin = !!(result[0].admin);
        // userDeleted.email = result[0].email;
        // userDeleted.roles = { admin };
        const admin = !!(result[0].roles);
        const userGet = {
          id: result[0].id,
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
        resp.status(404).send({ message: `El usuario con ${keyword} no existe para eliminar.` }).end();
      });
  });

  initAdminUser(app, next);
};

# Burger Queen - API with Node.js & Mysql & Insomnia 

## Container

* [1. Project summary](#1-project-summary)
* [2. Endpoints made](#2-endpoints-made)
* [3. CLI](#3-cli)

## 1.  Project summary

The API development of this project is aimed at a small hamburger restaurant, which needs an ordering system with the use of a tablet, to prepare the order in an orderly and efficient way.
## 2. Endpoints made

#### 2.1 `/`

* `GET /`
![Imagen1](https://user-images.githubusercontent.com/63525613/105422585-f7693a00-5c11-11eb-9881-745c6cfa21d0.png)
#### 2.2 `/auth`

* `POST /auth`
![Imagen2](https://user-images.githubusercontent.com/63525613/105422587-f801d080-5c11-11eb-8f43-7685ae1e784e.png)
#### 2.3 `/users`

* `GET /users`
![Imagen4](https://user-images.githubusercontent.com/63525613/105425809-0eab2600-5c18-11eb-9209-4420e502b4ac.png)
* `GET /users/:uid`
![Imagen6](https://user-images.githubusercontent.com/63525613/105425815-123ead00-5c18-11eb-93e5-c7f32e7c1f06.png)
* `POST /users`
![Imagen3](https://user-images.githubusercontent.com/63525613/105426000-5fbb1a00-5c18-11eb-9ee0-c247220ccc27.png)
* `PUT /users/:uid`
![Imagen7](https://user-images.githubusercontent.com/63525613/105425819-14087080-5c18-11eb-8a28-14d648b76dd4.png)
* `DELETE /users/:uid`
![Imagen5](https://user-images.githubusercontent.com/63525613/105425812-110d8000-5c18-11eb-9d17-49d0bdc9e977.png)
#### 2.4 `/products`

* `GET /products`
![Imagen12](https://user-images.githubusercontent.com/63525613/105425869-21bdf600-5c18-11eb-8701-59c51e40ec72.png)
* `GET /products/:productid`
![Imagen11](https://user-images.githubusercontent.com/63525613/105425851-1d91d880-5c18-11eb-99e2-009366d92c9c.png)
* `POST /products`
![Imagen8](https://user-images.githubusercontent.com/63525613/105425825-15d23400-5c18-11eb-84e7-cd65979822b1.png)
* `PUT /products/:productid`
![Imagen9](https://user-images.githubusercontent.com/63525613/105425832-18348e00-5c18-11eb-95fb-954e7e8358ed.png)
* `DELETE /products/:productid`
![Imagen10](https://user-images.githubusercontent.com/63525613/105425840-1a96e800-5c18-11eb-9182-08eab7cfcb3e.png)
#### 2.5 `/orders`

* `GET /orders`
![Imagen17](https://user-images.githubusercontent.com/63525613/105425903-2d112180-5c18-11eb-88e6-cf1fcfe9005f.png)
* `GET /orders/:orderId`
![Imagen16](https://user-images.githubusercontent.com/63525613/105425897-2b475e00-5c18-11eb-99a9-c517fecc3716.png)
* `POST /orders`
![Imagen13](https://user-images.githubusercontent.com/63525613/105425874-24205000-5c18-11eb-938c-ebe4b16e493a.png)
* `PUT /orders/:orderId`
![Imagen14](https://user-images.githubusercontent.com/63525613/105425878-2682aa00-5c18-11eb-80b2-d54c412de17d.png)
* `DELETE /orders/:orderId`
![Imagen15](https://user-images.githubusercontent.com/63525613/105425888-28e50400-5c18-11eb-91ff-f9ac05879503.png)
### 3. CLI

The client can run the API with ** `npm start` **, receiving information about the port on which it listens.

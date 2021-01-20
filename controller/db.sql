
CREATE DATABASE IF NOT EXISTS burguerqueen;
USE burguerqueen;

CREATE TABLE IF NOT EXISTS users
(
_id int(8) not null auto_increment, 
email varchar (25) NOT NULL,
password varchar (100) NOT NULL,
roles boolean,
primary key(_id)

);

CREATE TABLE IF NOT EXISTS products
(
_id int(8) not null auto_increment, 
name varchar (25) NOT NULL,
price FLOAT(6,2) NOT NULL,
image varchar(10000) NOT NULL,
type varchar(1000) NOT NULL,
dateEntry date NOT NULL,
primary key(_id)
);

CREATE TABLE IF NOT EXISTS orders
(
_id int(8) not null auto_increment, 
userId int (8)  NOT NULL,
client varchar (25)  NOT NULL,
status varchar (25)  NOT NULL,
dateEntry date  NOT NULL,
dateProcessed date  NOT NULL,
foreign key (userId) references users(_id) ON DELETE CASCADE,
primary key (_id)
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ordersDetails
(
orderId int(8) not null,
qty int(8) not null,
productId int(8) not null,
foreign key (orderId) references orders(_id) ON DELETE CASCADE,
foreign key (productId) references products(_id) ON DELETE CASCADE
)ENGINE=InnoDB;



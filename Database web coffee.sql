CREATE TABLE customer (
    id serial PRIMARY KEY,
    wallet numeric(10, 2) NOT NULL DEFAULT 0,
    phone varchar(20) NOT NULL UNIQUE,
    password varchar(50) NOT NULL,
    address varchar(100) NOT NULL,
    name varchar(100) NOT NULL
);
CREATE TABLE admin (
    id serial PRIMARY KEY,
    phone varchar(100) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    name varchar(100) NOT NULL
);


CREATE TABLE product (
    id serial PRIMARY KEY,
    name varchar(50) NOT NULL,
    price numeric(10, 2) NOT NULL,
    category varchar(15),
    inventory integer NOT NULL,
    img_path varchar(255),
    description text
);

CREATE TABLE "order" (
    id serial PRIMARY KEY,
    date timestamp NOT NULL,
    total_price numeric(10, 2) NOT NULL,
    customerid int NOT NULL,
    FOREIGN KEY (customerid) REFERENCES customer (id)
);

CREATE TABLE order_detail (
    id serial PRIMARY KEY,
    unit_price numeric(10, 2) NOT NULL,
    quantity integer NOT NULL,
    orderid int NOT NULL,
    productid int NOT NULL,
    FOREIGN KEY (orderid) REFERENCES "order" (id),
    FOREIGN KEY (productid) REFERENCES product (id)
);

INSERT INTO customer (balance, phone, name, address, password) VALUES
(5000.00, '1234567890', 'Nguyen Van A', '54 Nguyen Chi Thanh, Dong Da, Ha Noi','123456' ),
(3000.50, '1234567891', 'Tran Thi B', '273 An Duong Vuong, Quan 5, TP. Ho Chi Minh','123456' ),
(1500.75, '1234567892', 'Le Van C', '92 Le Thanh Nghi, Hai Ba Trung, Ha Noi', '123456');


INSERT INTO admin (phone, password, name) VALUES
('0987654321', 'pass123', 'Admin One'),
('0987654322', 'pass456', 'Admin Two');

INSERT INTO product (name, price, category, inventory, description) VALUES
('Apple', 20.00, 'Fruit', 100,  'Fresh apples'),
('Banana', 5.00, 'Fruit', 150, 'Organic bananas'),
('Carrot', 3.00, 'Vegetable', 200,'Healthy carrots');

INSERT INTO "order" (date, total_price, customerid) VALUES
('2024-01-01 10:00:00', 100.00, 1),
('2024-01-02 15:30:00', 45.50, 2),
('2024-01-03 12:20:00', 34.25, 3);

INSERT INTO order_detail (unit_price, quantity, orderid, productid) VALUES
(20.00, 3, 1, 1),
(5.00, 5, 2, 2),
(3.00, 7, 3, 3);
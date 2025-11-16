-- Sample SQL File for Testing
-- This file demonstrates the SQL viewer functionality

CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    age INT
);

INSERT INTO users VALUES (1, 'John Doe', 'john@example.com', 28);
INSERT INTO users VALUES (2, 'Jane Smith', 'jane@example.com', 32);
INSERT INTO users VALUES (3, 'Bob Johnson', 'bob@example.com', 45);

CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10,2),
    stock INT
);

INSERT INTO products VALUES (1, 'Laptop', 999.99, 15);
INSERT INTO products VALUES (2, 'Mouse', 29.99, 50);
INSERT INTO products VALUES (3, 'Keyboard', 79.99, 30);
INSERT INTO products VALUES (4, 'Monitor', 299.99, 20);

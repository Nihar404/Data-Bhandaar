-- SQL File with NULL values and different data types

CREATE TABLE customer_data (
    id INT PRIMARY KEY,
    email VARCHAR(100),
    phone VARCHAR(20),
    age INT,
    premium_member VARCHAR(10)
);

INSERT INTO customer_data VALUES (1, 'john@example.com', '555-0101', 28, 'Yes');
INSERT INTO customer_data VALUES (2, 'jane@example.com', NULL, 35, 'No');
INSERT INTO customer_data VALUES (3, 'bob@example.com', '555-0103', NULL, 'Yes');
INSERT INTO customer_data VALUES (4, NULL, '555-0104', 42, 'No');

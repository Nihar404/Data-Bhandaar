-- SQL File with Multiple Values in Single INSERT
-- This demonstrates comma-separated value sets

CREATE TABLE orders (
    order_id INT,
    customer_name VARCHAR(100),
    product VARCHAR(100),
    quantity INT,
    order_date DATE
);

INSERT INTO orders VALUES
    (1, 'John Doe', 'Laptop', 1, '2024-01-15'),
    (2, 'Jane Smith', 'Mouse', 3, '2024-01-16'),
    (3, 'Bob Johnson', 'Keyboard', 2, '2024-01-17'),
    (4, 'Alice Brown', 'Monitor', 1, '2024-01-18'),
    (5, 'Charlie Davis', 'Headphones', 2, '2024-01-19');

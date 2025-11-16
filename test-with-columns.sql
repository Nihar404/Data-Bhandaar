-- SQL File with Column Names Specified
-- This format explicitly lists column names in INSERT statements

INSERT INTO employees (id, name, department, salary) VALUES (1, 'Alice Johnson', 'Engineering', 75000);
INSERT INTO employees (id, name, department, salary) VALUES (2, 'Bob Smith', 'Marketing', 65000);
INSERT INTO employees (id, name, department, salary) VALUES (3, 'Carol Williams', 'Sales', 70000);
INSERT INTO employees (id, name, department, salary) VALUES (4, 'David Brown', 'Engineering', 80000);

INSERT INTO departments (dept_id, dept_name, manager) VALUES (1, 'Engineering', 'Alice Johnson');
INSERT INTO departments (dept_id, dept_name, manager) VALUES (2, 'Marketing', 'Bob Smith');
INSERT INTO departments (dept_id, dept_name, manager) VALUES (3, 'Sales', 'Carol Williams');

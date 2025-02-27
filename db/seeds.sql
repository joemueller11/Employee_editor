-- Seed data -- 
INSERT INTO departments (name) 
VALUES 
('HR'), 
('Engineering'), 
('Finance'), 
('Legal');

INSERT INTO roles (title, salary, department_id) 
VALUES
('HR Assistant', 80000, 1), 
('HR Lead', 150000, 1), 
('Engineer', 130000, 2),
('Lead Engineer', 250000, 2), 
('Accountant', 120000, 3),
('Accountant Manager', 250000, 3), 
('Lawyer', 120000, 4),
('Legal Team Lead', 250000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id) 
VALUES 
('John', 'Brown',4, null), 
('Joe', 'Mueller',3, 4),
('Max', 'Pain',2, null), 
('Billy', 'Kid',1, 2),
('Jesse', 'James',5, 6), 
('Annie', 'Oakley',6, null), 
('Buffalo', 'Bill',7, 8), 
('Wyatt', 'Earp',8, null);
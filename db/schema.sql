DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;
\c employees_db;

CREATE TABLE department (
id SERIAL PRIMARY KEY,
name VARCHAR(30) UNIQUE NOT NULL
);

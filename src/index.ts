
import pg from 'pg';
import { pool, connectToDb } from './connection.js';
import inquirer from 'inquirer';

await connectToDb();

inquirer
  .prompt([
    {
      type: 'input',
      name: 'action',
      message: 'Select from the following options',
      choices: ['View all Departments',
                'View all Roles',
                'View all Employees',
                'Add a Department',
                'Add a Role',
                'Add an Employee',
                'Update an Employee Role']
    }
  ])
  .then((answers) => {
 
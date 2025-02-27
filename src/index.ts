
import pg from 'pg';
import { pool, connectToDb } from './connection.js';
import inquirer from 'inquirer';

await connectToDb();

const promptUser = async () => {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: ['View Employees', 'Add Employee', 'Update Employee', 'Delete Employee', 'Exit']
      }
    ]);
    
    // Handle the selected action
    console.log(`Selected action: ${answer.action}`);
  };
  
  promptUser();

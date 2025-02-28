
import { pool, connectToDb } from './connection.js';
import inquirer from 'inquirer';

await connectToDb();
function startPrompt() {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Select from the following options',
          choices: [
            'View all Departments',
            'View all Roles',
            'View all Employees',
            'Add a Department',
            'Add a Role',
            'Add an Employee',
            'Update an Employee Role',
            'Exit'
          ]
        }
      ])
      .then((answers) => {
        const selectedChoice = answers.action;
        if (selectedChoice === 'View all Departments') {
          viewDepartments();
        } else if (selectedChoice === 'View all Roles') {
          viewRoles();
        } else if (selectedChoice === 'View all Employees') {
          viewEmployees();
        } else if (selectedChoice === 'Add a Department') {
          addDepartment();
        } else if (selectedChoice === 'Add a Role') {
          addRole();
        } else if (selectedChoice === 'Add an Employee') {
          addEmployee();
        } else if (selectedChoice === 'Update an Employee Role') {
          updateEmployeeRole();
        } else if (selectedChoice === 'Exit') {
          console.log('Exiting program...');
          process.exit(0);
        }
      });
}

// Function to view all departments
async function viewDepartments() {
  try {
    const results = await pool.query('SELECT * FROM department');
    
    console.log('\n=== DEPARTMENTS ===\n');
    console.table(results.rows);
    
    // Return to main menu
    startPrompt();
  } catch (err) {
    console.error('Error viewing departments:', err);
    startPrompt();
  }
}

// Function to view all roles
async function viewRoles() {
  try {
    const query = `SELECT r.id, r.title, r.salary, d.name AS department 
                   FROM role r
                   JOIN department d ON r.department_id = d.id`;
    const results = await pool.query(query);
    
    console.log('\n=== ROLES ===\n');
    console.table(results.rows);
    
    // Return to main menu
    startPrompt();
  } catch (err) {
    console.error('Error viewing roles:', err);
    startPrompt();
  }
}

// Function to view all employees
async function viewEmployees() {
  try {
    const query = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department,
                   r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
                   FROM employee e
                   LEFT JOIN role r ON e.role_id = r.id
                   LEFT JOIN department d ON r.department_id = d.id
                   LEFT JOIN employee m ON e.manager_id = m.id`;
    const results = await pool.query(query);
    
    console.log('\n=== EMPLOYEES ===\n');
    console.table(results.rows);
    
    // Return to main menu
    startPrompt();
  } catch (err) {
    console.error('Error viewing employees:', err);
    startPrompt();
  }
}

// Function to add a department
async function addDepartment() {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'departmentName',
        message: 'What is the name of the department?',
        validate: input => {
          if (input.trim() === '') {
            return 'Department name cannot be empty';
          }
          return true;
        }
      }
    ]);

    const departmentName = answers.departmentName;
    await pool.query('INSERT INTO department (name) VALUES ($1)', [departmentName]);
    
    console.log(`\nAdded ${departmentName} to departments\n`);
    
    // Return to main menu
    startPrompt();
  } catch (err) {
    console.error('Error adding department:', err);
    startPrompt();
  }
}

// Function to add a role
async function addRole() {
  try {
    // Get departments for the selection menu
    const departmentsRes = await pool.query('SELECT * FROM department');
    const departments = departmentsRes.rows;
    
    if (departments.length === 0) {
      console.log('\nYou need to add a department before you can add a role.\n');
      return startPrompt();
    }
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'What is the title of the role?',
        validate: input => input.trim() !== '' ? true : 'Role title cannot be empty'
      },
      {
        type: 'input',
        name: 'salary',
        message: 'What is the salary for this role?',
        validate: input => {
          const num = parseFloat(input);
          return !isNaN(num) && num > 0 ? true : 'Please enter a valid salary (number greater than 0)';
        }
      },
      {
        type: 'list',
        name: 'departmentId',
        message: 'Which department does this role belong to?',
        choices: departments.map(dept => ({
          name: dept.name,
          value: dept.id
        }))
      }
    ]);

    // Insert the new role into the database
    await pool.query(
      'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)',
      [answers.title, answers.salary, answers.departmentId]
    );
    
    console.log(`\nAdded ${answers.title} role with a salary of $${answers.salary}\n`);
    
    // Return to main menu
    startPrompt();
  } catch (err) {
    console.error('Error adding role:', err);
    startPrompt();
  }
}
// Function to add an employee
async function addEmployee() {
    try {
      // Get roles for the selection menu
      const rolesRes = await pool.query('SELECT id, title FROM role');
      const roles = rolesRes.rows;
      
      if (roles.length === 0) {
        console.log('\nYou need to add roles before you can add employees.\n');
        return startPrompt();
      }
      
      // Get employees for manager selection
      const employeesRes = await pool.query('SELECT id, first_name, last_name FROM employee');
      const employees = employeesRes.rows;
      
      // Create manager choices with option for no manager
      const managerChoices = [
        { name: 'None', value: null },
        ...employees.map(emp => ({
          name: `${emp.first_name} ${emp.last_name}`,
          value: emp.id
        }))
      ];
      
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'firstName',
          message: "What is the employee's first name?",
          validate: input => input.trim() !== '' ? true : "First name cannot be empty"
        },
        {
          type: 'input',
          name: 'lastName',
          message: "What is the employee's last name?",
          validate: input => input.trim() !== '' ? true : "Last name cannot be empty"
        },
        {
          type: 'list',
          name: 'roleId',
          message: "What is the employee's role?",
          choices: roles.map(role => ({
            name: role.title,
            value: role.id
          }))
        },
        {
          type: 'list',
          name: 'managerId',
          message: "Who is the employee's manager?",
          choices: managerChoices
        }
      ]);
  
      // Insert the new employee into the database
      await pool.query(
        'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
        [answers.firstName, answers.lastName, answers.roleId, answers.managerId]
      );
      
      console.log(`\nAdded ${answers.firstName} ${answers.lastName} to employees\n`);
      
      // Return to main menu
      startPrompt();
    } catch (err) {
      console.error('Error adding employee:', err);
      startPrompt();
    }
  }
  // Function to update an employee's role
async function updateEmployeeRole() {
    try {
      // Get all employees
      const employeesRes = await pool.query('SELECT id, first_name, last_name FROM employee');
      const employees = employeesRes.rows;
      
      if (employees.length === 0) {
        console.log('\nNo employees found. Please add employees first.\n');
        return startPrompt();
      }
      
      // Get all roles
      const rolesRes = await pool.query('SELECT id, title FROM role');
      const roles = rolesRes.rows;
      
      if (roles.length === 0) {
        console.log('\nNo roles found. Please add roles first.\n');
        return startPrompt();
      }
      
      // Prompt user to select an employee and a new role
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'employeeId',
          message: 'Which employee\'s role do you want to update?',
          choices: employees.map(emp => ({
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.id
          }))
        },
        {
          type: 'list',
          name: 'roleId',
          message: 'Which role do you want to assign to the selected employee?',
          choices: roles.map(role => ({
            name: role.title,
            value: role.id
          }))
        }
      ]);
      
      // Update the employee's role in the database
      await pool.query(
        'UPDATE employee SET role_id = $1 WHERE id = $2',
        [answers.roleId, answers.employeeId]
      );
      
      // Find the employee and role details to display in confirmation message
      const employee = employees.find(emp => emp.id === answers.employeeId);
      const role = roles.find(role => role.id === answers.roleId);
      
      console.log(`\nUpdated ${employee.first_name} ${employee.last_name}'s role to ${role.title}\n`);
      
      // Return to main menu
      startPrompt();
    } catch (err) {
      console.error('Error updating employee role:', err);
      startPrompt();
    }
  }
// Start the application
startPrompt();

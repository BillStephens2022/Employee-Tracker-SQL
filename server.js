// Import & Require
const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');

// Set up of server on a port
const PORT = process.env.PORT || 3001;
const app = express();

// for user to select from a list of existing departments in the database
let departmentArray = [];
// for user to select froma list of existing roles in the database
let rolesArray = [];
// for user to select a manager from a list of employees in the database
let managersArray = [];
// for user to select (using Inquirer from an array of things that the application can do)
let appChoices = ["View All Employees", "Add Employee", "Update Employee Role", "View All Roles", "Add Role", "View All Departments", "Add Department"];

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Database connection
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'Password123!',
        database: 'employees_db'
    },
    console.log('Connected to the employees_db database')
);

// function to prompt user with list of things to do and to execute functions depending on their choice.
function promptUser() {
    inquirer.prompt([
    {
        type: "list",
        message: "What would you like to do",
        name: "userChoice",
        choices: appChoices
    }
    ]).then((answer) => {
        switch (answer.userChoice) {
            case "View All Employees":
                viewAllEmployees();
            break;
            case "Add Employee":
                addEmployee();
            break;
            case "Update Employee Role":
                updateEmployeeRole();
            break;
            case "View All Roles":
                viewAllRoles();
            break;
            case "Add Role":
                addRole();
            break;
            case "View All Departments":
                viewAllDepartments();
            break;
            case "Add Department":
                addDepartment();
            break;
        }
    })
    
}

// function to run an sql query to view all departments
function viewAllDepartments() {
    db.query(`SELECT * FROM department`, (err, results) => {
        (err) ? console.log(err) : console.table(results);
    });
}

// function to run an sql query to view all roles
function viewAllRoles() {
    db.query(`SELECT role.id, title, department.name AS department, salary 
    FROM role INNER JOIN department ON role.department_id = department.id;`, (err, results) => {
        (err) ? console.log(err) : console.table(results);
    });
}

// function to run sql query to view all employees
function viewAllEmployees() {
    db.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
    CONCAT(e.first_name, ' ',e.last_name) AS manager
    FROM employee
    INNER JOIN role ON role.id = employee.role_id
    INNER JOIN department ON department.id = role.department_id
    LEFT JOIN employee e ON employee.manager_id = e.id;`, (err, results) => {
        (err) ? console.log(err) : console.table(results);
    });
}

// function to add department
function addDepartment() {
    inquirer.prompt([
        {
            type: "input",
            name: "newDepartment",
            message: "What is the name of the Department?"
        }
    ]).then((answer) => {
        db.query(`INSERT INTO department (name) VALUES ("${answer.newDepartment}")`)
        console.log(`Added ${answer.newDepartment} to the database`);
    });
}

// function to add role
function addRole() {
    inquirer.prompt([
        {
            type: "input",
            name: "roleName",
            message: "What is the name of the Role?"
        },
        {
            type: "input",
            name: "roleSalary",
            message: "What is the salary of the role?"
        },
        {
            type: "list",
            name: "roleDepartment",
            message: "What department does the role belong to?",
            choices: getDepartmentArray()
        }
    ]).then((answer) => {
        let departmentId = getDepartmentArray().indexOf(answer.roleDepartment) + 1
        db.query(`INSERT INTO role (title, salary, department_id) VALUES ("${answer.roleName}", ${answer.roleSalary}, ${departmentId})`)
        console.log(`Added ${answer.roleName} with salary ${answer.roleSalary} to the database and department ${answer.roleDepartment} with id: ${departmentId}`)
    });
}

// function to get an array of departments
function getDepartmentArray() {
    db.query(`SELECT name FROM department;`, (err, res) => {
        if (err) {
            console.log(err);
        } 
        for (let i = 0; i < res.length; i++) {     
            departmentArray.push(res[i].name);
        };
    });
    return departmentArray;
}

// function to add employee
function addEmployee() {
    inquirer.prompt([
        {
            type: "input",
            name: "firstName",
            message: "What is the employee's first name?"
        },
        {
            type: "input",
            name: "lastName",
            message: "What is the employee's last name?"
        },
        {
            type: "list",
            name: "employeeRole",
            message: "What is the employee's role?",
            choices: getRolesArray()
        },
        {
            type: "list",
            name: "employeeManager",
            message: "Who is the employee's manager?",
            choices: getManagersArray()
        }
    ]).then((answer) => {
        let roleId = getRolesArray().indexOf(answer.employeeRole) + 1
        let managerId = getManagersArray().indexOf(answer.employeeManager) + 1;
        db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${answer.firstName}", "${answer.lastName}", ${roleId}, ${managerId})`)
        console.log(`Added ${answer.firstName} ${answer.lastName} with role ${answer.employeeRole} reporting to ${answer.employeeManager} to the database`)
    });
}

// function to get an array of roles
function getRolesArray() {
    db.query(`SELECT title FROM role;`, (err, res) => {
        if (err) {
            console.log(err);
        } 
        for (let i = 0; i < res.length; i++) {     
            rolesArray.push(res[i].title);
        };
    });
    return rolesArray;
}

// function to get an array of managers
function getManagersArray() {
    db.query(`SELECT first_name, last_name, id FROM employee;`, (err, res) => {
        if (err) {
            console.log(err);
        } 
        for (let i = 0; i < res.length; i++) {
            let managerName = `${res[i].first_name} ${res[i].last_name}`;
            managersArray.push(managerName);
        };
    });
    return managersArray;
}


promptUser();

// set up Express server to listen on PORT defined above.
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

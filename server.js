// Import & Require
const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');

const PORT = process.env.PORT || 3001;
const app = express();

let departmentArray = [];

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

function promptUser() {
    inquirer.prompt([
    {
        type: "list",
        message: "What would you like to do",
        name: "userChoice",
        choices: [
            "View All Employees",
            "Add Employee",
            "Update Employee Role",
            "View All Roles",
            "Add Role",
            "View All Departments",
            "Add Department"
            ]
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

// get department id of role name
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




promptUser();



// set up Express server to listen on PORT defined above.
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

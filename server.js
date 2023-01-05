// Import & Require
const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');

const PORT = process.env.PORT || 3001;
const app = express();

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
    ]).then(function(answer) {
        console.log(answer.userChoice);
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
function addDepartment(newDepartment) {
    db.query(`INSERT INTO department (name) VALUES ("${newDepartment}")`)
    console.log(`Added ${newDepartment} to the database`);
}

// function to add department
function addRole(newRole, newSalary, department) {

    let departmentId = db.query(`SELECT id FROM department WHERE name = ${department}`);
    console.log(departmentId);
    db.query(`INSERT INTO role (title, salary, department_id) VALUES ("${newRole}", ${newSalary}, "${departmentId}")`)
    console.log(`Added ${newRole} to the database`);
}

// test function calls - to be removed later
promptUser();
// const newRole = "Marketing Lead";
// const newSalary = 140000;
// const department = "Marketing";

// addRole(newRole, newSalary, department);
// viewAllDepartments();
// viewAllRoles();
// viewAllEmployees();


// set up Express server to listen on PORT defined above.
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

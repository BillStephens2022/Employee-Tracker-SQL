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

// function to run sql query to view all employees
function viewAllEmployees() {
    db.query(`SELECT employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
    CONCAT(e.first_name, ' ',e.last_name) AS manager
    FROM employee
    INNER JOIN role ON role.id = employee.role_id
    INNER JOIN department ON department.id = role.department_id
    LEFT JOIN employee e ON employee.manager_id = e.id;`, (err, results) => {
        (err) ? console.log(err) : console.table(results);
    });
}

// function to run an sql query to view all employees
function viewAllDepartments() {
    db.query(`SELECT * FROM department`, (err, results) => {
        (err) ? console.log(err) : console.table(results);
    });
}

// function to run an sql query to view all employees
function viewAllRoles() {
    db.query(`SELECT role.id, title, department.name AS department, salary 
    FROM role INNER JOIN department ON role.department_id = department.id;`, (err, results) => {
        (err) ? console.log(err) : console.table(results);
    });
}

viewAllDepartments();
viewAllRoles();
viewAllEmployees();



// set up Express server to listen on PORT defined above.
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

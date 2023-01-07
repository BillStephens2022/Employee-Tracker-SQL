// Import & Require
const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');

// Set up of server on a port
const PORT = process.env.PORT || 3001;
const app = express();





// for user to select (using Inquirer from an array of things that the application can do)
let appChoices = ["View All Employees", "Add Employee", "Update Employee Role", "View All Roles", "Add Role", "View All Departments", "Add Department", "Quit Application"];

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

// for user to select a manager from a list of employees in the database
let employeeArray = getEmployeesArray();
// for user to select froma list of existing roles in the database
let roleArray = getRolesArray();
// for user to select from a list of existing departments in the database
let departmentArray = getDepartmentArray();

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
            case "Quit Application":
                process.exit();
        }
    })
    
}

// function to run an sql query to view all departments
function viewAllDepartments() {
    db.query(`SELECT * FROM department`, (err, results) => {
        if (err) {
            console.log(err);
         } else {
            console.table(results);
            promptUser();
         };
    });
}

// function to run an sql query to view all roles
function viewAllRoles() {
    db.query(`SELECT role.id, title, department.name AS department, salary 
    FROM role INNER JOIN department ON role.department_id = department.id;`, (err, results) => {
        if (err) {
            console.log(err);
         } else {
            console.table(results);
            promptUser();
         };
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
        if (err) {
            console.log(err);
         } else {
            console.table(results);
            promptUser();
         }; 
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
        db.query(`INSERT INTO department (name) VALUES ("${answer.newDepartment}")`, (err, res) => {
            if (err) {
                console.log(err)
            } else {
                console.log(`Added ${res.newDepartment} to the database`)
                departmentArray = getDepartmentArray();
                promptUser();
            } 
        });
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
            choices: departmentArray
        }
    ]).then((answer) => {
            db.query(`SELECT id FROM department WHERE name = "${answer.roleDepartment}";`, (err, result) => {
            let departmentId = setValue(result[0].id);
            db.query(`INSERT INTO role (title, salary, department_id) VALUES ("${answer.roleName}", ${answer.roleSalary}, ${departmentId})`);
            console.log(`Added ${answer.roleName} with salary ${answer.roleSalary} to the database and department ${answer.roleDepartment} with id: ${departmentId}`);
            roleArray = getRolesArray();
            promptUser();
        })      
})
}

// function to get an array of departments
function getDepartmentArray() {
    let departmentArr = [];
    db.query(`SELECT name FROM department;`, (err, res) => {
        if (err) {
            console.log(err);
        } 
        for (let i = 0; i < res.length; i++) {     
            departmentArr.push(res[i].name);
        };
    });
    return departmentArr;
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
            choices: roleArray
        },
        {
            type: "list",
            name: "employeeManager",
            message: "Who is the employee's manager?",
            choices: employeeArray
        }
    ]).then((answer) => {
        db.query(`SELECT id FROM role WHERE title = "${answer.employeeRole}";`, (err, result) => {
            let roleId = setValue(result[0].id);
            db.query(`SELECT id FROM employee WHERE CONCAT(first_name, " ", last_name) = "${answer.employeeManager}";`, (err, result) => {
                let managerId = setValue(result[0].id);
        db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${answer.firstName}", "${answer.lastName}", ${roleId}, ${managerId})`)
        console.log(`Added ${answer.firstName} ${answer.lastName} with role ${answer.employeeRole} reporting to ${answer.employeeManager} to the database`)
            })
            employeeArray = getEmployeesArray();
            promptUser();
        })
    });
}

// function to get an array of roles
function getRolesArray() {
    let roleArr = [];
    db.query(`SELECT title FROM role;`, (err, res) => {
        if (err) {
            console.log(err);
        } 
        for (let i = 0; i < res.length; i++) {     
            roleArr.push(res[i].title);
        };
    });
    return roleArr;
}

// function to get an array of managers
function getEmployeesArray() {
    let employeeArr = [];
    db.query(`SELECT first_name, last_name, id FROM employee;`, (err, res) => {
        if (err) {
            console.log(err);
        } 
        for (let i = 0; i < res.length; i++) {
            let employeeName = `${res[i].first_name} ${res[i].last_name}`;
            employeeArr.push(employeeName);
        };
    });
    return employeeArr;
}

function updateEmployeeRole() {
    inquirer.prompt([
        {
            type: "list",
            name: "employeeName",
            message: "Which employee's role would you like to update?",
            choices: employeeArray
        },
        {
            type: "list",
            name: "employeeRole",
            message: "Which role do you want to assign to the selected employee?",
            choices: roleArray
        }
    ]).then((answer) => {
        db.query(`SELECT id FROM role WHERE title = "${answer.employeeRole}";`, (err, result) => {
            let roleId = setValue(result[0].id);
            db.query(`SELECT id FROM employee WHERE CONCAT(first_name, " ", last_name) = "${answer.employeeName}";`, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    let employeeId = setValue(result[0].id);
                    db.query(`UPDATE employee SET role_id = ${roleId} WHERE id = ${employeeId};`, (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(`Updated ${answer.employeeName} to have role ${answer.employeeRole} to the database`)
                            promptUser();
                        }
                    });
                    
                }
                
        
        
            })
            
        })
    });
}


function setValue(value) {
    setId = value;
    return setId;
}

promptUser();

// set up Express server to listen on PORT defined above.
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

-- view all departments
SELECT * FROM department;

-- view all roles
SELECT role.id, title, department.name AS department, salary 
FROM role
INNER JOIN department ON role.department_id = department.id;

-- view all employees
SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
CONCAT(e.first_name, ' ',e.last_name) AS manager
FROM employee
INNER JOIN role ON role.id = employee.role_id
INNER JOIN department ON department.id = role.department_id
LEFT JOIN employee e ON employee.manager_id = e.id;

-- add department
INSERT INTO department (name)
VALUES("")
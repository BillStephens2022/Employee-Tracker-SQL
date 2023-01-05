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

// set up Express server to listen on PORT defined above.
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

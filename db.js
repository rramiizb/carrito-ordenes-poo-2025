const mysql = require("mysql2/promise");

<<<<<<< Updated upstream
const db = mysql.createPool({
    host: "localhost",
    user: "grupo5",
    password: "grupo5",
    database: "tienda",
    port: 3306
});

module.exports = db;

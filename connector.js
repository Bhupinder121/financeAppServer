const mysql = require('mysql');

var mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Bhupinder@1234",
    database: "financeApp",
    multipleStatements: true
});

mysqlConnection.connect((err) => {
    if (!err) {
        console.log("connected");

    }
    else {
        console.log(err);
        console.log("Not connected");
    }
});

module.exports = mysqlConnection;
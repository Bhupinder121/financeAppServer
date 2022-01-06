const connector = require('./connector.js');
const encrypt = require('D:/Projects/encrypt/encrypt_decrypt.js')
let monthTable = "month_dec";

// let command = "CREATE TABLE `financeapp`.`test_month` (\
//     `dayID` INT NOT NULL AUTO_INCREMENT,\
//     `day` VARCHAR(45) NULL,\
//     `date` DATE NULL,\
//     `amt` INT NULL,\
//     `budget` INT NULL,\
//     `exp` INT NULL,\
//     PRIMARY KEY (`dayID`));"

let data = "VH0ehxbn8b6BiJdiu8h3nk1y2ywSE2CbdRsxENHOb5q7ZsCGcqcu7DTvKWyvP4SIWo28h3nk1l8h3nk1Bx8HA2mqbwOX8fWVZS34Qd3ink2d3ink2"
while(data.includes("t36i") || data.includes("8h3nk1") || data.includes("d3ink2") ){
    data = data.replace("t36i", "+").replace("8h3nk1", "/").replace("d3ink2", "=")
}
console.log(data)
console.log(encrypt.decrypt(data))


// connector.query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE "month_%"`, (err, rows, fields) => {
//     if (!err) {
//         console.log(rows)
//     }
//     else {
//         console.log(err);
//     }
// })
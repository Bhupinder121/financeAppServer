const connector = require('./connector.js');
let monthTable = "month_dec";

let command = "CREATE TABLE `financeapp`.`test_month` (\
    `dayID` INT NOT NULL AUTO_INCREMENT,\
    `day` VARCHAR(45) NULL,\
    `date` DATE NULL,\
    `amt` INT NULL,\
    `budget` INT NULL,\
    `exp` INT NULL,\
    PRIMARY KEY (`dayID`));"

update()


const express = require('express');
const bodyParser = require('body-parser');
const encryption = require('./encrypt_decrypt.js');
const sqlConnection = require("./connector.js");

let app = express();
app.use(bodyParser.json());

let Days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
let defaultAmt = 500;
let defautPer = 10;
let toggle = true;

app.listen(420, ()=>{
    console.log('listening on port 420');
});


app.get('/sendData', (req, res)=>{
    let reqData = req.query.data_query[0];
    while(reqData.includes("t36i") || reqData.includes("8h3nk1") || reqData.includes("d3ink2")){
        reqData = reqData.replace("t36i", "+").replace("8h3nk1", "/").replace("d3ink2", "=");
    }
    reqData = encryption.decrypt(reqData);
 // add decryption
    if(reqData != ""){
        try{
            getDBData(reqData,function(rows){
                for(var i = 0; i<rows.length; i++){
                    if(rows[i]["date"] != undefined){
                        rows[i]["date"] = rows[i]["date"].toLocaleString();
                    }
                }
                let encryptedString = encryption.encrypt(JSON.stringify(rows));
                while(encryptedString.includes("+") || encryptedString.includes("/") || encryptedString.includes("=")){
                    encryptedString = encryptedString.replace("+", "t36i").replace("/", "8h3nk1").replace("=", "d3ink2");
                }
                 // Add encryption 
                
                res.status(200).send(encryptedString);
            });
        }
        catch(err){
            console.log(err);
        }
    }
});

app.post('/getData', (req, res)=>{
    var encryptedString = req.query["nameValuePairs"]["json"];
    let jsonData = JSON.parse(encryption.decrypt(encryptedString));

    if(jsonData["exp"] != undefined){
        addExp(jsonData);
    }
    else if(jsonData["budgetPer"] != undefined){
        updatePer(jsonData["budgetPer"]);
    }
    else if(jsonData["income"] != undefined){
        updateincome(jsonData["income"])
    }
});

function updatePer(per){
    let command = `SELECT * FROM ${getTableName()} WHERE date = '${getCurrentDate()}'`;
    getDBData(command, function(row){
        if(row.length > 0){
            command = `UPDATE ${getTableName()} SET budgetPer = ${per}, budget = ${(per/100) * row[0]["amt"]} WHERE date = '${getCurrentDate()}'` 
            postData(command, function(ok){

            });
        }
    });
}

function updateincome(amt){
    let command = `SELECT * FROM ${getTableName()} WHERE date = '${getCurrentDate()}'`;
    getDBData(command, function(row){
        if(row.length > 0){
            command = `UPDATE ${getTableName()} SET amt = ${parseInt(row[0]["amt"])+parseInt(amt)} WHERE date = '${getCurrentDate()}'` 
            postData(command, function(ok){

            });
        }
    });
}

function addExp(jsonData){
    let monthTable = getTableName(new Date().getMonth());
    let command = `SELECT * FROM ${monthTable} WHERE date = '${getCurrentDate()}'`;
    getDBData(command, function(row){
        if(row.length > 0){
            command = `UPDATE ${monthTable} SET exp = ${parseInt(row[0]["exp"]) + parseInt(jsonData["exp"])} WHERE date = '${getCurrentDate()}'`;
            postData(command, function(ok){
                
            });
        }
    });
    let categoryCommand = `SELECT * FROM exp_category WHERE date = '${getCurrentDate()}' and ExpCate = "${jsonData["cate"]}"`;
    getDBData(categoryCommand, (row) =>{
        if(row.length == 0){
            categoryCommand = `INSERT INTO exp_category (date, ExpAmt, ExpCate) VALUE('${getCurrentDate()}', ${jsonData["exp"]}, "${jsonData["cate"]}")`
        }
        else{
            categoryCommand = `UPDATE exp_category SET ExpAmt = ${parseInt(row[0]["ExpAmt"]) + parseInt(jsonData["exp"])} WHERE date = '${getCurrentDate()}' and ExpCate = "${jsonData["cate"]}"`
        }
        postData(categoryCommand, function(ok){
                
        });
    })
    
}


function update(){
    checkAndUpdateMonthTable();
}


function checkAndUpdateDayRow(){
    let monthTable = getTableName();
    
    let command = `SELECT * FROM ${monthTable} WHERE date <= '${getCurrentDate()}' ORDER BY dayID DESC LIMIT 1`;
    getDBData(command, function(row){
        if(row.length == 0){
            let previousMonthIndex = new Date().getMonth()-1;
            let previousYear = new Date().getFullYear()
            if(previousMonthIndex == -1){
                previousMonthIndex = 11;
                previousYear -= 1;
            }
            let previousMonthName = getTableName(index=previousMonthIndex, year=previousYear);
            command = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = "${previousMonthName}"`;
            getDBData(command, (dataRow)=>{
                if(dataRow.length == 0){
                    let exp = 0;
                    let amt = defaultAmt - exp;
                    let budget = (defautPer/100) * amt
                    command = `INSERT INTO ${monthTable} (day, date, amt, budget, exp, budgetPer) VALUE("${getCurrentDay()}", '${getCurrentDate()}', ${amt}, ${budget}, ${0}, ${defautPer})`;
                    postData(command, function(ok){
                
                    });
                }
                if(dataRow.length > 0){
                    getDataPrevious(previousMonthName);
                }
            });
        }
        else{
            let date = new Date(row[0]["date"]).getDate();
            if(date != new Date().getDate()){
                getDataPrevious(monthTable)
            }
        }
    });
}

function getDataPrevious(month_table){
    command = `SELECT * FROM ${month_table} ORDER BY dayID DESC LIMIT 1`;
    getDBData(command, (dataRow)=>{
        let exp = parseInt(dataRow[0]["exp"]);
        let amt = parseInt(dataRow[0]["amt"]) - exp;
        let budgetPer = parseInt(dataRow[0]["budgetPer"])
        let budget = (budgetPer/100) * amt
        command = `INSERT INTO ${getTableName()} (day, date, amt, budget, exp, budgetPer) VALUE("${getCurrentDay()}", '${getCurrentDate()}', ${amt}, ${budget}, ${0}, ${budgetPer})`;
        postData(command, function(ok){
                
        });
    });
}

function checkAndUpdateMonthTable(){
    let command = `SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = "${getTableName()}"`;
    getDBData(command, function(table){
        if(table.length == 0){
            toggle = false
            let command = `CREATE TABLE financeapp.${getTableName()} (
                dayID INT NOT NULL AUTO_INCREMENT,
                day VARCHAR(45) NULL,
                date DATE NULL,
                amt INT NULL,
                budget INT NULL,
                exp INT NULL,
                budgetPer INT NULL,
                PRIMARY KEY (dayID))`;
            postData(command, function(stats){
                if(stats == "OK"){
                    toggle = true;
                }
            });
        }
        if(toggle){
            checkAndUpdateDayRow();
        }
    });
}

function getTableName(index = new Date().getMonth(), year = new Date().getFullYear()){
    return `month_${months[index]}_${year}`;
}


async function getDBData(command, callback) {
    sqlConnection.query(command, (err, rows, fields) => {
        if (!err) {
            return callback(rows);
        }
        else {
            console.log(err);
        }
    });
}

function postData(command, callback) {
    sqlConnection.query(command, (err, rows, fields) => {
        if (!err) {
            console.log("OK");
            return callback("OK");
        }
        else {
            console.log(err);
        }
    });
}

function getCurrentDay(){
    return Days[new Date().getDay()]
}

function getCurrentDate(){
    var date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

setInterval(function (){
    update();
}, 750);

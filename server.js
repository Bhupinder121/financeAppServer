const express = require('express');
const bodyParser = require('body-parser');
const encryption = require('D:/Projects/encrypt/encrypt_decrypt.js');
const sqlConnection = require("./connector.js");

let app = express();
app.use(bodyParser.json());

let monthTable = "month_dec";
let Days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let Days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

app.listen(420, ()=>{
    console.log('listening on port 420');
});


app.get('/sendData', (req, res)=>{
    let reqData = encryption.decrypt(req.query.data_query);
    if(reqData != ""){
        try{
            getDBData(reqData, function(rows){
                let encryptedString = encryption.encrypt(JSON.stringify(rows));
                res.status(200).send(encryptedString);
            });
        }
        catch(err){
            console.log(err);
        }
    }
});

app.post('/getData', (req, res)=>{
    var encryptedString = req.body.nameValuePairs["json"];
    let jsonData = JSON.parse(encryption.decrypt(encryptedString));

    if(jsonData["exp"] != undefined){
        addExp(jsonData);
    }
});

function addExp(jsonData){
    let command = `SELECT * FROM ${monthTable} WHERE date = '${getCurrentDate()}'`;
    getDBData(command, function(row){
        if(row.length > 0){
            command = `UPDATE ${monthTable} SET exp = ${parseInt(row[0]["exp"]) + parseInt(jsonData["exp"])} WHERE date = '${getCurrentDate()}'`;
            postData(command)
        }
    });
    let categoryCommand = `SELECT * FROM exp_category WHERE ExpDate = '${getCurrentDate()}' and ExpCate = "${jsonData["cate"]}"`;
    getDBData(categoryCommand, (row) =>{
        if(row.length == 0){
            categoryCommand = `INSERT INTO exp_category (ExpDate, ExpAmt, ExpCate) VALUE('${getCurrentDate()}', ${jsonData["exp"]}, "${jsonData["cate"]}")`
        }
        else{
            categoryCommand = `UPDATE exp_category SET ExpAmt = ${parseInt(row[0]["ExpAmt"]) + parseInt(jsonData["exp"])} WHERE ExpDate = '${getCurrentDate()}' and ExpCate = "${jsonData["cate"]}"`
        }
        postData(categoryCommand);
    })
    
}

updateDay();
function updateDay(){
    let command = `SELECT * FROM ${monthTable} WHERE date <= '${getCurrentDate()}' ORDER BY dayID DESC LIMIT 1`;
    getDBData(command, function(row){
        if(row.length == 0){
            // Make to reverse in tables 
        }
        else{
            let date = new Date(row[0]["date"]).getDate();
            if(date != new Date().getDate()){
                command = `SELECT * FROM ${monthTable} ORDER BY dayID DESC LIMIT 1`; // TODO: MAke previous table check
            }
        }
        getDBData(command, (dataRow)=>{
            let exp = parseInt(dataRow[0]["exp"]);
            let amt = parseInt(dataRow[0]["amt"]) - exp;
            let budget = (10/100) * amt
            command = `INSERT INTO ${monthTable} (day, date, amt, budget, exp) VALUE("${getCurrentDay()}", '${getCurrentDate()}', ${amt}, ${budget}, ${0})`;
            console.log(command);
        });
    });
}


function isCurrentExist(callback){
    let command = `SELECT * FROM ${monthTable} WHERE date = '${getCurrentDate()}'`;
    getDBData(command, function(row){
        if(row.length == 0){
            return callback(false);
        }
        else{
            return callback(true);
        }
    })
}


function getDBData(command, callback) {
    sqlConnection.query(command, (err, rows, fields) => {
        if (!err) {
            return callback(rows);
        }
        else {
            console.log(err);
        }
    });
}

function postData(command) {
    sqlConnection.query(command, (err, rows, fields) => {
        if (!err) {
            console.log("OK");
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

const CryptoJS = require('crypto-js');
var key  = CryptoJS.enc.Latin1.parse('2222222222222222');
var iv   = CryptoJS.enc.Latin1.parse('2222222222222222');  

function encrypt(data){
    var encrypted = CryptoJS.AES.encrypt(
        data,
        key,
        {iv:iv,mode:CryptoJS.mode.CBC,padding:CryptoJS.pad.Pkcs7}
        );

    let encryptedData = encrypted.toString();
    while(encryptedData.includes("/") || encryptedData.includes("+") || encryptedData.includes("=")){
        encryptedData = encryptedData.replace('+','t36i').replace('/','8h3nk1').replace('=','d3ink2')
    }
    return encryptedData;
}

function decrypt(data){
    var decrypted = CryptoJS.AES.decrypt(data,key,
    {iv:iv, 
        mode:CryptoJS.mode.CBC,
        padding:CryptoJS.pad.Pkcs7}
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
}

module.exports = {encrypt: encrypt, decrypt: decrypt}
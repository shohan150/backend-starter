//dependencies
const crypto = require('crypto');
const environments = require('./environments');

// module scaffolding
const utilities = {};


// parse JSON string to Object
// we will receive the realData JSON string here. This utlity function is to convert json string to object after checking.
utilities.parseJSON = (jsonString) => {
    let output;
   //ekhane JSON string k parse kore object e convert korbo.
    try {
        output = JSON.parse(jsonString);
    } catch {
      //valid json na dile, system jate crash na sejonno try-catch block use kora. json k thik moto parse na korte parle, mane valid json na dile, error asbe ebong catch block e chole asbe.
        output = {};
    }
    //finally, checking er maddhome json string theke object e convert kore, take return kori. 
    return output;
};

// hash string
utilities.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        //console.log(environments, process.env.NODE_ENV);
        const hash = crypto.createHmac('sha256', environments.secretKey).update(str).digest('hex');
        return hash;
    }
    return false;
};

// create random string
utilities.createRandomString = (strlength) => {
   let length = typeof strlength === 'number' && strlength > 0 ? strlength : false;

   if (length) {
       const possiblecharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
       let output = '';
       for (let i = 1; i <= length; i += 1) {
           const randomCharacter = possiblecharacters.charAt(
               Math.floor(Math.random() * possiblecharacters.length)
           );
           output += randomCharacter;
       }
       return output;
   }
   return false;
};

// export module
module.exports = utilities;
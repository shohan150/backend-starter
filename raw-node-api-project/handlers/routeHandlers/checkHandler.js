//handle user defined checks
// dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');
const tokenHandler = require('./TokenHandler')

// module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    //handleReqRes module e chosenHandler k invoke korar somoy 2 ta parameter diye deya hoeche. tar modde req er method ki seta check kore nilam.
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
      //condition meet hle, corresponding function k invoke kori checkHandler e pawa 2 ta parameter diye. handler._check.methodName(requestProperties, callback);
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        // not in acceptedMethods, invoke callback with 405 status code
        callback(405);
    }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
    //validate the input link
    //protocol string datatype kina ebong string hle 'http' ba 'https' hle shei protocal k nao else false. 
    let protocol = typeof(requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;
    //url validation
    let url = typeof(requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;
    //method validation
    //redundant! checking ekbar korechi. checking kore e ekhane aschi. naki ekhane checking ta hit kora url e na borong j url ta save korchi tar upor. dekha jak samne. korle bujhbo.
    let method = typeof(requestProperties.body.method) === 'string' && ['get', 'post', 'put', 'delete'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;
};

handler._check.get = (requestProperties, callback) => {
    
};


handler._check.put = (requestProperties, callback) => {
    
};

handler._check.delete = (requestProperties, callback) => {
    
};

module.exports = handler;
//handle user defined checks
// dependencies
const data = require('../../lib/data');
const { hash, createRandomString, parseJSON } = require('../../helpers/utilities');
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
    let method = typeof(requestProperties.body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;
    //array kintu asole object e. sejonno array k detect korte hobe instanceof diye. karon js e sob e object. object diye e Arrar class constructor use kore (new Array) tar instance object banano hoi, jei object asole array er moto behave kore. asole to r array na. 
    let successCodes = typeof(requestProperties.body.successCodes) === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;
    //kotokkhon somoy pojronto amra wait korbo responce er jonno. seta user diye dibe. ei somoy er modde responce na pele, url down dekhiye dibe.
    //check kori number ta whole number kina. partial(vognasgso) number hle cholbe na. r user 1-5 er modde ekta number dite parbe sudhu.
    let timeoutSeconds = typeof(requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds > 1 && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false;

    //if all individually verified than start post operation
    if(protocol && url && method && successCodes && timeoutSeconds){
        //verify token
        let token = typeof(requestProperties.headersObject.token) === "string"?requestProperties.headersObject.token : false;

        //lookup the user phone using the token
        data.read('tokens', token, (err1, tokenData) =>{
            if(!err1 && tokenData){
                let userPhone = parseJSON(tokenData).phone;

                //lookup the user data
                data.read('users', userPhone, (err2, userData) =>{
                    if(!err2 && userData){
                    tokenHandler._token.verify(token, userPhone, (tokenIsValid) =>{
                        if(tokenIsValid){
                            let userObject = parseJSON(userData);
                            let userChecks = typeof(userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                            if(userChecks.length < 5){
                                //creating the unique id to store in database
                                let checkId = createRandomString(20);
                                let checkObject = {
                                    "id" : checkId,
                                    userPhone,
                                    protocol,
                                    url, 
                                    method,
                                    successCodes,
                                    timeoutSeconds
                                }

                                //finally, save the object
                                data.create('checks', checkId, checkObject, (err3)=>{
                                    if(!err3){
                                        //err na thakle userObject e checkId k add kori.
                                        userObject.checks = userChecks;
                                        userObject.checkObject.push(checkId)

                                        //save the new userData
                                        data.update('users', userPhone, userObject, (err4)=>{
                                            if(!err4){
                                                //if all okay, finally check object ta return kore dite pari jate user dekhte pare ki kaj holo. abar na dileo kono osubidha nai.
                                                callback(200, checkObject);

                                                //31.20 te test korlo.

                                            } else{
                                                callback(500, {
                                                    error : "There is a problem in server side"
                                                })
                                            }
                                        })
                                    } else{
                                        callback(500, {
                                            error : "There is a problem in server side"
                                        })
                                    }
                                })
                            } else{
                                callback(401, {
                                    error : "User has already reached maximum check limit."
                                })
                            }
                        } else{
                            callback(403, {
                                error : "Authentication problem"
                            })
                        }
                    })
                    } else{
                        callback(403, {
                            error : "User not found"
                        })
                    }
                })
            }
        })
    } else{
        //ei 5 ta value thik na thakle, callback e error pathiye dao.
        callback(400, {
            error : "You have a problem in your request"
        })
    }
};

handler._check.get = (requestProperties, callback) => {
    // check the token if valid
    const id =
    typeof requestProperties.queryStringObject.id === 'string' &&
    requestProperties.queryStringObject.id.trim().length === 20
        ? requestProperties.queryStringObject.id
        : false;

    if(id){
        //lookup the check
        data.read('checks', id, (err, checkData) =>{
            if(!err && checkData){
            //verify token
            let token = typeof(requestProperties.headersObject.token) === "string"?requestProperties.headersObject.token : false;

            tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) =>{
                if(tokenIsValid){
                    callback(200, parseJSON(checkData))
                } else{
                    callback(403, {
                        error : "Authentication Error"
                    })
                }
            })
            } else{
                callback(500, {
                    error : "You have a problem in your request"
                })
            }
        })
    } else{
        callback(400, {
            error : "You have a problem in your request"
        })
    }
};


handler._check.put = (requestProperties, callback) => {
    let id = typeof(requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;

    //id check kora hoye gele, baki parameter gulo individual checking complete kori.
    let protocol = typeof(requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    let url = typeof(requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    let method = typeof(requestProperties.body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    let successCodes = typeof(requestProperties.body.successCodes) === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;

    let timeoutSeconds = typeof(requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds > 1 && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false;

    if(id){
        if(protocol || url || method || successCodes || timeoutSeconds) {
            data.read('checks', id, (err1, checkData) =>{
                if(!err1 && checkData){
                    const checkObject = parseJSON(checkData);

                    //verify token
                    let token = typeof(requestProperties.headersObject.token) === "string"?requestProperties.headersObject.token : false;

                    tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) =>{
                        if(tokenIsValid){
                            //token valid hle j data pathiyeche tader update kori.
                            if(protocol) {
                                checkObject.protocol = protocol;
                            }
                            if(url) {
                                checkObject.url = url;
                            }
                            if(method) {
                                checkObject.method = method;
                            }
                            if(successCodes) {
                                checkObject.successCodes = successCodes;
                            }
                            if(timeoutSeconds) {
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }

                            // finally save
                            data.update('checks', id, checkObject, (err2)=>{
                                if(!err2){
                                    callback(200);
                                } else {
                                    callback(500, {
                                        error : "Server side error"
                                    })
                                }
                            })
                        } else {
                            callback(403, {
                                error : "Authorization error"
                            })
                        }
                    })
                } else{
                    callback(500, {
                        error : "Serve side problem"
                    })
                }
            })
        } else {
            callback(400, {
                error : "You must provide at least on e field to update"
            })
        }
    } else {
        callback(400, {
            error : "You have a problem in your request"
        })
    }
};

handler._check.delete = (requestProperties, callback) => {
    const id =
    typeof requestProperties.queryStringObject.id === 'string' &&
    requestProperties.queryStringObject.id.trim().length === 20
        ? requestProperties.queryStringObject.id
        : false;

    if(id){
        //lookup the check
        data.read('checks', id, (err, checkData) =>{
            if(!err && checkData){
            //verify token
            let token = typeof(requestProperties.headersObject.token) === "string"?requestProperties.headersObject.token : false;

            tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) =>{
                if(tokenIsValid){
                    //delete the checkData
                    data.delete('checks', id, (err1)=>{
                        if(!err1){
                            data.read('users', parseJSON(checkData).userPhone, (err2, userData)=>{
                                let userObject = parseJSON(userData);
                                if(!err2 && userData){
                                    let userChecks = typeof(userObject).checks === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                    let checkPosition = userChecks.indexOf(id);
                                    if(checkPosition > -1){
                                        userChecks.splice(checkPosition, 1);

                                        //reset the userData
                                        userObject.checks = userChecks;
                                        data.update('checks', userObject.phone, userObject, (err3) =>{
                                            if(!err4){
                                                callback(200);
                                            } else{
                                                callback(500, {
                                                    error : "Serve side problem"
                                                })
                                            }
                                        })
                                    } else {
                                        callback(500, {
                                            error : "The checkid is not found"
                                        })
                                    }
                                } else {
                                    callback(500, {
                                        error : "Serve side problem"
                                    })
                                }
                            })
                        } else {
                            callback(500, {
                                error : "Serve side problem"
                            })
                        }
                    })
                } else{
                    callback(403, {
                        error : "Authentication Error"
                    })
                }
            })
            } else{
                callback(500, {
                    error : "You have a problem in your request"
                })
            }
        })
    } else{
        callback(400, {
            error : "You have a problem in your request"
        })
    }
};

module.exports = handler;
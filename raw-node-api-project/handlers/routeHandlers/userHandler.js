//sob same url ei kaj korbe. /user/. kon method e request kora hocche tar upor depend kore server action nibe.
// dependencies
const data = require('../../lib/data');
const { parseJSON, hash } = require('../../helpers/utilities');
const tokenHandler = require('./TokenHandler')

// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    //handleReqRes module e chosenHandler k invoke korar somoy 2 ta parameter diye deya hoyeche. tar modde requestProperties er modde req er method ki seta deya ache. amra check korbo amader 4 ta method er konota te req kora hoyeche kina. jodi acceptedMethods er baire kono method er req kora hoi tahole .indexOf er result asbe -1. R thakle, index number ta asbe. Tar mane -1 er theke boro hle e array te ache. -1 asa mane array te nai. tahle callback e status code 405 pathai dao which means, the request is not allowed. r ekhane payload pathano lagche na callback er sathe.
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
      //condition meet hle, corresponding function k invoke kori useHandler e pawa 2 ta parameter diye. handler._users.methodName(requestProperties, callback);
        handler._users[requestProperties.method](requestProperties, callback);
    } else {
        // not in acceptedMethods, invoke callback with 405 status code
        callback(405);
    }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
    //check if each value sent by user with request is in valid format
    const firstName =
        typeof requestProperties.body.firstName === 'string' &&
        requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;

    const lastName =
        typeof requestProperties.body.lastName === 'string' &&
        requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : false;

    const phone =
        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : false;

    const password =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password
            : false;

    const tosAgreement =
        typeof requestProperties.body.tosAgreement === 'boolean' &&
        requestProperties.body.tosAgreement
            ? requestProperties.body.tosAgreement
            : false;
    
    //if all values provided, start processing. R hae. Folder create kore rakha lagbe. Folder create kora na thakle, folder create korar feature ekhono add kora hoi ni. 
    if (firstName && lastName && phone && password && tosAgreement) {
        // make sure that the user doesn't already exist. na thakle amra user create korbo r thakle error throw korbo callback e. tarmane requirement holo user na thaka ba error asle tokhon user create kora. data read korata requirement na. sejonno callback e sudhu error nile e hocche. data neyar dorkar nai.
        data.read('users', phone, (err1) => {
            //mane lib.read() try korbe fs.readFile diye data read korte. file na thakle read korte parbe na, tokhon error return korbe sudhu, kono data return korbe na. shei error k niye lib.read() er vitor callback k invoke kora ache ei error o data diye. tahole shei callback eror ta peye gelo. kintu callback function konta? eta. ekhane declare kora function take e invoke kora hobe lib.read() er vitor. logic simple. lib.read k jemon, folder name, file name bole dicchi, temnivabe callback function ta ki hobe setao bole dicchi.
            //tahole file read korte giye error pawa mane file nai. tahole file create koro.  
            if (err1) {
                //the data to ba paased to the create function.
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };
                // store the user to db
                data.create('users', phone, userObject, (err2) => {
                    //err2 te false bade kono value pawa mane e, unsuccessful operation. karon kono eoor hle e tokhon, kono text content/string diye callback k invoke kora hoyeche lib.create er vitor. r sudhu sob step complte hle e callback k false diye invoke kora hoyeche. tarmane err2 te false pele, operation successful. 
                    if (!err2) {
                        callback(200, {
                            message: 'User was created successfully!',
                        });
                    } else {
                        //callback was invoked with a value. so, error has occured at a stage. we don't know exactly what stage, but it has occured. to see exactly what error has occured inside lib.create() :
                        //console.log(err2);
                        callback(500, { error: 'Could not create user!' });
                    }
                });
            } else {
               //cilent already exists. this is server side problem. 
                callback(500, {
                    error: 'There was a problem in server side!',
                });
            }
        });
    } else {
      //client er request e kono problem thakle, 400 error dite hoi.
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

// @TODO: Authentication - done
handler._users.get = (requestProperties, callback) => {
    // check the phone number if valid. why checking again and again?! because each request are separate.
    const phone =
        typeof requestProperties.queryString.phone === 'string' &&
        requestProperties.queryString.phone.trim().length === 11
            ? requestProperties.queryString.phone
            : false;
    if (phone) {
        //verify token
        let token = typeof(requestProperties.headersObject.token) === "string" ? requestProperties.headersObject.token : false;        

        tokenHandler._token.verify(token, phone, (tokenId)=>{
            if(tokenId){
                //successful hle, ei phone er against e thaka existing token expire hoi ni ekhono.Now, lookup the user in the db.
                //first e ei kaj ta directly kortam. ekhm same code verification er por execute korchi.
                data.read('users', phone, (err, uData) => {
                    const user = { ...parseJSON(uData) };
                    if (!err && user) {
                    //user er data callback e pathanor age tar password remove kore dite hobe. Obossoi password k reveal kore deya jabe na. r first e uData niye tarpor take spread kore abar user const e neyar karon holo, parameter e pawa data k direct mutate kora recommend kore na eslint. sejonno onno variable e niye, shei variable theke password ta remove kore, data ta callback e pathiye dei. 
                        delete user.password;
                        callback(200, user);
                    } else {
                        callback(404, {
                            error: 'Requested user was not found!',
                        });
                    }
                });
            } else{
                callback(403, {
                    error: "Authentication failed"
                })
            }
        });
    } else {
        callback(404, {
            error: 'Requested user was not found!',
        });
    }
};

// @TODO: Authentication
handler._users.put = (requestProperties, callback) => {
    // check the phone number if valid
    const phone =
        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : false;

    const firstName =
        typeof requestProperties.body.firstName === 'string' &&
        requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;

    const lastName =
        typeof requestProperties.body.lastName === 'string' &&
        requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : false;

    const password =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password
            : false;

    if (phone) {
        if (firstName || lastName || password) {
        // loopkup the user
        //ekhon ekahne verification bosabo. tarpor read korbo.
        //verify token
        let token = typeof(requestProperties.headersObject.token) === "string"?requestProperties.headersObject.token : false;

        tokenHandler._token.verify(token, phone, (tokenId)=>{
            if(tokenId){
                //successful hle lookup the user. first ei kaj ta directly kortam. ekhm same code verification er por execute korchi.
                data.read('users', phone, (err1, uData) => {
                    const userData = { ...parseJSON(uData) };
    
                    if (!err1 && userData) {
                        if (firstName) {
                            userData.firstName = firstName;
                        }
                        if (lastName) {
                            userData.lastName = lastName;
                        }
                        if (password) {
                            userData.password = hash(password);
                        }
    
                        // store to database
                        data.update('users', phone, userData, (err2) => {
                            if (!err2) {
                                callback(200, {
                                    message: 'User was updated successfully!',
                                });
                            } else {
                                callback(500, {
                                    error: 'There was a problem in the server side!',
                                });
                            }
                        });
                    } else {
                        callback(400, {
                            error: 'You have a problem in your request!',
                        });
                    }
                });
            } else{
                callback(403, {
                    error: "Authentication failed"
                })
            }
        });
        } else {
            callback(400, {
                error: 'You have a problem in your request!',
            });
        }
    } else {
        callback(400, {
            error: 'Invalid phone number. Please try again!',
        });
    }
};

// @TODO: Authentication
handler._users.delete = (requestProperties, callback) => {
    // check the phone number if valid
    const phone =
        typeof requestProperties.queryString.phone === 'string' &&
        requestProperties.queryString.phone.trim().length === 11
            ? requestProperties.queryString.phone
            : false;

    if (phone) {
        // lookup the user
        //verify token
        let token = typeof(requestProperties.headersObject.token) === "string" ? requestProperties.headersObject.token : false;

        tokenHandler._token.verify(token, phone, (tokenId)=>{
            if(tokenId){
                //successful hle lookup the user. first ei kaj ta directly kortam. ekhm same code verification er por execute korchi.
                data.read('users', phone, (err1, userData) => {
                    if (!err1 && userData) {
                        data.delete('users', phone, (err2) => {
                            if (!err2) {
                                callback(200, {
                                    message: 'User was successfully deleted!',
                                });
                            } else {
                                callback(500, {
                                    error: 'There was a server side error!',
                                });
                            }
                        });
                    } else {
                        callback(500, {
                            error: 'There was a server side error!',
                        });
                    }
                });
            } else{
                callback(403, {
                    error: "Authentication failed"
                })
            }
        });

    } else {
        callback(400, {
            error: 'There was a problem in your request!',
        });
    }
};

module.exports = handler;
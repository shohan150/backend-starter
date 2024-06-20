//sob same url ei kaj korbe. /user/. kon method e request kora hocche tar upor depend kore server action nibe.
// dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');

// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    //handleReqRes module e chosenHandler k invoke korar somoy 2 ta parameter diye deya hoeche. tar modde requestProperties er modde req er method ki seta deya ache. amra check korbo amader 4 ta method er konota te req kora hoyeche kina. jodi acceptedMethods er baire kono method er req kora hoi tahole .indexOF er result asbe -1. r thakle, index number ta asbe. Tar mane -1 er theke boro hle e array te ache. -1 asa mane array te nai. tahle callback e status code 405 pathai dao which means, the request is not allowed. r ekhane payload pathano lagche na callback er sathe. 
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
      //condition meet hle, corresponding function k invoke kori useHandler e pawa 2 ta parameter diye. handler._users.methodName(requestProperties, callback);
        handler._users[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
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

    if (firstName && lastName && phone && password && tosAgreement) {
        // make sure that the user doesn't already exists. na thakle amra user create korbo r thakle error throw korbo callback e. tarmane requirement holo user na thaka ba error asle tokhon user create kora. data readr korata requirement na. sejonno callback e sudhu error nile e hocche. data neyar dorkar nai. 
      
        data.read('users', phone, (err1) => {
            if (err1) {
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };
                // store the user to db
                data.create('users', phone, userObject, (err2) => {
                    if (!err2) {
                        callback(200, {
                            message: 'User was created successfully!',
                        });
                    } else {
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

// @TODO: Authentication
handler._users.get = (requestProperties, callback) => {
    // check the phone number if valid
    const phone =
        typeof requestProperties.queryString.phone === 'string' &&
        requestProperties.queryString.phone.trim().length === 11
            ? requestProperties.queryString.phone
            : false;
    if (phone) {
        // lookup the user
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
    } else {
        callback(400, {
            error: 'There was a problem in your request!',
        });
    }
};

module.exports = handler;
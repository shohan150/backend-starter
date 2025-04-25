//what is token based authentication? user login korle take server ekta unique number diye dibe. ekhn full application j feature gulote login required, segulote check korbo user er kache token number number ache kina. It is more like a short time password for the server to identify whether an user is authenticated or not.
// dependencies
const data = require('../../lib/data');
const { parseJSON, hash, createRandomString } = require('../../helpers/utilities');


// module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {
   //validate or check the phone and password sent with the request.
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

   // if both okay, find that user and check if correct password is provided.
    if (phone && password) {
        data.read('users', phone, (err1, userData) => {
         //server e amra password k hash kore store korechi. sejonno login korar somoy provided password keo hash kore, main password er sathe checking korte hobe. 
         //console.log(phone, password, userData);
            const hashedpassword = hash(password);
            if (hashedpassword === parseJSON(userData).password) {
               
               //match korte ekta token assign kori. 
                const tokenId = createRandomString(20);
                //expires in 1 hour
                const expires = Date.now() + 60 * 60 * 1000;
                
                const tokenObject = {
                    phone,
                    id: tokenId,
                    expires,
                };
                
                // store the token
                data.create('tokens', tokenId, tokenObject, (err2) => {
                    if (!err2) {
                        callback(200, tokenObject);
                    } else {
                        callback(500, {
                            error: 'There was a problem in the server side!',
                        });
                    }
                });
            } else {
                callback(400, {
                    //match na korle, password match kore ni. 
                    error: 'Password is not valid!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

//get er asole kono kaj e nai apatoto. Rakha hoise sudhu. 
handler._token.get = (requestProperties, callback) => {
    // check the token id if valid
    const id =
        typeof requestProperties.queryString.id === 'string' &&
        requestProperties.queryString.id.trim().length === 20
            ? requestProperties.queryString.id
            : false;
    if (id) {
        // lookup the token
        data.read('tokens', id, (err, tokenData) => {
            const token = { ...parseJSON(tokenData) };
            if (!err && token) {
                callback(200, token);
            } else {
                callback(404, {
                    error: 'Requested token was not found!',
                });
            }
        });
    } else {
        callback(404, {
            error: 'Requested token was not found!',
        });
    }
};

//put ba edit mane ekehane token k refresh kora. mane user jodi existing token pathiye, extend=true dei, tahole token er expiry increase kore deya hobe. 
handler._token.put = (requestProperties, callback) => {
    const id =
        typeof requestProperties.body.id === 'string' &&
        requestProperties.body.id.trim().length === 20
            ? requestProperties.body.id
            : false;
    const extend = !!(
        typeof requestProperties.body.extend === 'boolean' && requestProperties.body.extend === true
    );

    if (id && extend) {
        data.read('tokens', id, (err1, tokenData) => {
            const tokenObject = parseJSON(tokenData);
            if (tokenObject.expires > Date.now()) {
                tokenObject.expires = Date.now() + 60 * 60 * 1000;
                // store the updated token
                data.update('tokens', id, tokenObject, (err2) => {
                    if (!err2) {
                        callback(200);
                    } else {
                        callback(500, {
                            error: 'There was a server side error!',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Token already expired!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'There was a problem in your request',
        });
    }
};

//token delete mane asole user k logout kore deya.
handler._token.delete = (requestProperties, callback) => {
    // check the token if valid
    console.log(requestProperties.queryString);
    
    const id =
        typeof requestProperties.queryString.id === 'string' &&
        requestProperties.queryString.id.trim().length === 20
            ? requestProperties.queryString.id
            : false;

    if (id) {
        // lookup the user
        data.read('tokens', id, (err1, tokenData) => {
            if (!err1 && tokenData) {
                data.delete('tokens', id, (err2) => {
                    if (!err2) {
                        callback(200, {
                            message: 'Token was successfully deleted!',
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

handler._token.verify = (id, phone, callback) => {
    data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            if (parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

module.exports = handler;
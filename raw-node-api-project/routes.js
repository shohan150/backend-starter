// dependencies
const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler');
const {userHandler} = require('./handlers/routeHandlers/userHandler');
const {tokenHandler} = require('./handlers/routeHandlers/TokenHandler');
const {checkHandler} = require('./handlers/routeHandlers/checkHandler');

//contains all possible routes
const routes = {
    sample: sampleHandler,
    user: userHandler,
    token: tokenHandler,
    check: chackHandler,
};

module.exports = routes;
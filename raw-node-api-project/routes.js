// dependencies
const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler');
const {userHandler} = require('./handlers/routeHandlers/userHandler')

//contains all possible routes
const routes = {
    sample: sampleHandler,
    user: userHandler
};

module.exports = routes;
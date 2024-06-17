// dependencies
const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler');

//contains all possible routes
const routes = {
    sample: sampleHandler,
};

module.exports = routes;
// Title: Uptime Monitoring Application
// Description: A RESTful API to monitor up or down time of user defined links
// Date: 15/6/2024

// dependencies. divide for server in one file and background workers in another
const server = require('./lib/server');
const workers = require('./lib/worker');

// app object - module scaffolding
const app = {};

app.init = () => {
   // start the server
   server.init();
   // start the workers
   workers.init();
};

//initiate root app.
app.init();

// export the app
module.exports = app;
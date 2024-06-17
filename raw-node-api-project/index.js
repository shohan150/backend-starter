
// Title: Uptime Monitoring Application
// Description: A RESTful API to monitor up or down time of user defined links
// Date: 15/6/2024


//dependencies
//transfer data over the Hyper Text Transfer Protocol (HTTP)
const http = require('http');
//import request respose handler function
const {handleReqRes} = require('./helpers/handleReqRes');

//app object - module scaffolding: Scaffolding helps generate a basic structure for your project, a skeleton for the application.
const app = {};

//configuration
app.config={
   port: 3000 
};

// application er mul kaj ekehane e hobe.
app.handleReqRes = handleReqRes;

//create server
app.createServer =()=>{
   //create the server using built in createServer module in http.
   //this module takes a callback function what will create the server object and will handle request and response. 
   const server = http.createServer(app.handleReqRes);

   server.listen(app.config.port, ()=> {console.log(`listening to port ${app.config.port}`)});
}


//finally, call the server
app.createServer();


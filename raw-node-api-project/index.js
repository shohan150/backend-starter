
// Title: Uptime Monitoring Application
// Description: A RESTful API to monitor up or down time of user defined links
// Date: 15/6/2024


//dependencies
const http = require('http');


//app object - module scaffolding: Scaffolding helps generate a basic structure for your project, a skeleton for the application.
const app = {};

//configuration
app.config={
   port: 3000 
};

//create server
app.createServer =()=>{
   //create the server using built in createServer module in http.
   //this module takes a callback function what will create the server object and will handle request and response. 
   const server = http.createServer(app.handleReqRes);

   server.listen(app.config.port, ()=> {console.log("listensing to port")});
}

app.handleReqRes = (req, res) =>{
   //responce handle
   res.end('Hello World');
}

//finally, call the server
app.createServer();


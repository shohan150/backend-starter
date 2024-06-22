
// Title: Uptime Monitoring Application
// Description: A RESTful API to monitor up or down time of user defined links
// Date: 15/6/2024


//dependencies
//transfer data over the Hyper Text Transfer Protocol (HTTP)
const http = require('http');
//import request respose handler function
const {handleReqRes} = require('./helpers/handleReqRes');
//environment variables
const environment = require('./helpers/environments');
//import data file
const data = require('./lib/data');

//app object - module scaffolding: Scaffolding generate a basic structure for your project, a skeleton for the application.
const app = {};

// //testing file system
// data.create('test', 'newFile', {name:"shohan", age:26}, (err)=>console.log('Error is: ' + err));
// data.read('test', 'newFile', (err, result)=>console.log(err, result));
// data.update('test', 'newFile', {name:"shohanur", age:25}, (err)=>console.log('Error is: ' + err));
// data.delete('test', 'newFile', (err)=>console.log(err));

//configuration
// app.config={
//    port: 3000 
// };

// application er mul kaj ekehane e hobe.
app.handleReqRes = handleReqRes;

//create server
app.createServer =()=>{
   //create the server using built in createServer module in http.
   //this module takes a callback function what will create the server object and will handle request and response. 
   const server = http.createServer(app.handleReqRes);

   server.listen(environment.port, ()=> {console.log(`listening to port ${environment.port}`)});
}


//finally, call the server
app.createServer();


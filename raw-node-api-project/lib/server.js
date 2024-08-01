//dependencies
//transfer data over the Hyper Text Transfer Protocol (HTTP)
const http = require('http');
//import request respose handler function
const {handleReqRes} = require('../helpers/handleReqRes');
//environment variables
const environment = require('../helpers/environments');

//twilio test
// const { sendTwilioSms } = require('./helpers/notifications');

//import data file
// const data = require('../lib/data');

//app object - module scaffolding: Scaffolding generate a basic structure for your project, a skeleton for the application.
const server = {};

// //testing file system
// data.create('test', 'newFile', {name:"shohan", age:26}, (err)=>console.log('Error is: ' + err));
// data.read('test', 'newFile', (err, result)=>console.log(err, result));
// data.update('test', 'newFile', {name:"shohanur"}, (err)=>console.log('Error is: ' + err));
//data.delete('test', 'newFile', (err)=>console.log(err));

//configuration
// server.config={
//    port: 3000 
// };

//twilio test
// sendTwilioSms('01234567890', 'Hello World', (res)=>{
//    console.log(`This is the error : ${res}`);
// })

// application er mul kaj ekehane e hobe.
server.handleReqRes = handleReqRes;

//create server
server.createServer =()=>{
   //create the server using built in createServer module in http.
   //this module takes a callback function what will create the server object and will handle request and response. 
   const createServer = http.createServer(server.handleReqRes);

   createServer.listen(environment.port, ()=> {console.log(`listening to port ${environment.port}`)});
}


//finally, start the server
server.init = () => {
   server.createServer();
};

// export
module.exports = server;
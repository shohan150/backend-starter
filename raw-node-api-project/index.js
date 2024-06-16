
// Title: Uptime Monitoring Application
// Description: A RESTful API to monitor up or down time of user defined links
// Date: 15/6/2024


//dependencies
//transfer data over the Hyper Text Transfer Protocol (HTTP)
const http = require('http');
//The URL module splits up a web address into readable parts.
const url = require('url');

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
   // application er mul kaj ekehane e hobe.
   //request handle
   //get that url and parse it
   //The url.parse() method returns an object with each part of the address as properties. takes two parameters; urlString: holds the URL string which needs to parse. parseQueryString: whether to parse (conversion. in this case simply turn into an object) the query string in url. If set to true then the query property will be set to an object. If set to false then the query property will be an unparsed, undecoded string. The default value is false.
   const parseUrl = url.parse(req.url, false);
   //console.log(parseUrl); 
   const path = parseUrl.pathname
   //responce handle
   res.end('Hello World');
}

//finally, call the server
app.createServer();


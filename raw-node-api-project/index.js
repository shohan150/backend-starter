
// Title: Uptime Monitoring Application
// Description: A RESTful API to monitor up or down time of user defined links
// Date: 15/6/2024


//dependencies
//transfer data over the Hyper Text Transfer Protocol (HTTP)
const http = require('http');
//The URL module splits up a web address into readable parts.
const url = require('url');
//bringing a portion of string_decoder module. 
const {StringDecoder} = require('string_decoder');

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
   const parseUrl = url.parse(req.url, true);
   //console.log(parseUrl); 
   const path = parseUrl.pathname;
   const queryString = parseUrl.query;
   // using regex to remove the forward slash at the beginning and end of the link. So that we always get the link in the same format and then perform routing. Cause people may request the same page with forward slash at the end or not but we need to send data to client in both scenerio. 
   const trimmedPath = path.replace(/^\/+|\/+$/g, "");
   //detach request type or method
   const method = req.method.toLowerCase();
   //get the website metadata (sent as headers) from server.
   const headersObject = req.headers;

   //GET method request e query parameter gulo to query te pawa jai. POST request korar somoy server e kono data pathate hle, seta req er body te pathate hbe. etake directky pathano jai na borong streaming kore pathate hoi. streaming e buffer k pathano hobe. tarpor shei buffer theke data te convert kora hobe. toString() use kore UTF-8 encoding apply kore data ana already dekhechi. Tobe ekhn recommended way te dekhbo. 
   //at first, event listener add korbo, req.on("data", func) diye. mane data event hle mane server theke data aslei ei callback function invoke hobe. R server theke to data asbe buffer datatype e. Ebar buffer k toString() ebong encoding apply kore data te convert na kore, node.js er recommended way te convert korbo.
   //stringDecoder module use kore. Jehetu eta ekta class return kore, mane  sonstructor return kore. Tai age shei class er ekta object baniye nei.
   const decoder = new StringDecoder('utf-8');
   let realData = "";
   req.on("data", (buffer)=>{
      //convert buffer to data and store
      realData += decoder.write(buffer);
   });

   //buffer pathano shes hoye gele end event fire kore.
   req.on("end",()=>{
      //decoder er kaj shes. take seta janiye dao. 
      realData += decoder.end();
      //realData filled up. ekhon setake dekhte pari. 
      console.log(realData);
   })

   //responce handle
   res.end('Hello World');
}

//finally, call the server
app.createServer();


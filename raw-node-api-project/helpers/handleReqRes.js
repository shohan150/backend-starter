//module dependencies
//The URL module splits up a web address into readable parts.
const url = require('url');
//bringing a portion of string_decoder module. 
const {StringDecoder} = require('string_decoder');
const routes = require('../routes');
const { notFoundHandler } = require('../handlers/routeHandlers/notFoundHandler');

//module scaffloding
const handler = {};

handler.handleReqRes = (req, res) =>{
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

   //handler function jehetu onno file e thakbe tai, request related sob property shei handler k pass kore dite hobe. 
   const requestProperties = {
      parseUrl,
      path,
      trimmedPath,
      method,
      queryString,
      headersObject,
  };

   //GET method request e query parameter gulo to query te pawa jai. POST request korar somoy server e kono data pathate hle, seta req er body te pathate hbe. etake directky pathano jai na borong streaming kore pathate hoi. streaming e buffer k pathano hobe. tarpor shei buffer theke data te convert kora hobe. toString() use kore UTF-8 encoding apply kore data ana already dekhechi. Tobe ekhn recommended way te dekhbo. 
   //at first, event listener add korbo, req.on("data", func) diye. mane data event hle mane server theke data aslei ei callback function invoke hobe. R server theke to data asbe buffer datatype e. Ebar buffer k toString() ebong encoding apply kore data te convert na kore, node.js er recommended way te convert korbo.
   //stringDecoder module use kore. Jehetu eta ekta class return kore, mane  sonstructor return kore. Tai age shei class er ekta object baniye nei.
   const decoder = new StringDecoder('utf-8');
   let realData = "";

   //end of variable declaration. Now decalre the handlers.

   //check if the requested route from client exists or not. If exists, store reference of the the corresponding request handler function. If not, store reference of the notFoundHandler function.
   const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;

   //now invoke the chosenHandler function: chosenHandler();
   //ekhn chosenHandler to onno ekta module k refer kore ache. shei module e value gulo pete, ei value gulo k function invoke korar somoy parameter hisebe pathiye dite hobe, jate kore, chosenHandler invoke howa mane, refer kora func ta invoke howa r refer kora func ta pass kora parameter(requestProperties) niye e execute hoi. 
   //tar sathe 2nd parameter hisebe chosenHandler k ekta callback function diye deya hocche. ei call back func k handler er vitor theke invoke korte hobe. handler statusCode r payload er value diye ei 2nd parameter e pass kora function k invoke korbe. shei pass kora value er upor depend kore finally response pathano hobe. 
   //place chosenHandler inside the 'end' eventHandler so that we can access realData inside the handler.

   req.on("data", (buffer)=>{
      //convert buffer to data and store
      realData += decoder.write(buffer);
   });

   //buffer pathano shes hoye gele end event fire kore.
   req.on("end",()=>{
      //decoder er kaj shes. take seta janiye dao. 
      realData += decoder.end();
      //realData filled up. ekhon setake dekhte parbo server e. 
      // console.log(realData);

      chosenHandler(requestProperties, (statusCode, payload) => {
         //check statusCode and payload
          statusCode = typeof statusCode === 'number' ? statusCode : 500;
          payload = typeof payload === 'object' ? payload : {};
   
          const payloadString = JSON.stringify(payload);
   
          // return the final response
          res.writeHead(statusCode);
          res.end(payloadString);
      });

      //responce handle
      //streaming shes howa mane request kore complete. tokhon reponse server theke client er kache pathai.
      // res.end('Hello World');
   })

}

module.exports = handler;
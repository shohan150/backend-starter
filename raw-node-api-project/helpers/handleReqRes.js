//module dependencies
//The URL module splits up a web address into readable parts.
const url = require('url');
//bringing a class of string_decoder module to decode buffers (chunks of binary data) into strings.
const {StringDecoder} = require('string_decoder');
const routes = require('../routes');
const { notFoundHandler } = require('../handlers/routeHandlers/notFoundHandler');
const {parseJSON} = require('../helpers/utilities');

//module scaffloding
const handler = {};

handler.handleReqRes = (req, res) =>{
   //request handle
   //get that url and parse it
   //The url.parse() method returns an object with each part of the address as properties. takes two parameters; urlString: holds the URL string which needs to parse. parseQueryString: whether to parse (parsing in simple words is conversion. in this case turn into an object) the query string in url. If set to true then the query property will be set to an object. If set to false then the query property will be an unparsed, undecoded string. The default value is false.
   const parseUrl = url.parse(req.url, true);
   //console.log(parseUrl); 
   //pathname nicchi. path na. karon query ekhane nibo na. query neya lagbe checking er somoy, tokhon path nibo. kitu ekhane sudhu pathname.
   const path = parseUrl.pathname;
   const queryString = parseUrl.query;
   // using regex to remove the forward slash at the beginning and end of the link. So that we always get the link in the same format and then perform routing. Cause people may request the same page with forward slash at the end or not(/users or /users/) but we need to send data to client in both scenerio. 
   const trimmedPath = path.replace(/^\/+|\/+$/g, "");
   //request type or method: GET, POST, PATCH, DELETE
   const method = req.method.toLowerCase();
   //get the website metadata (sent as headers).
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

   //GET method request e query parameter gulo to query te pawa jai. POST request korar somoy server e kono data pathate hle, seta req er body te pathate hbe. etake directky pathano jai na borong streaming kore pathate hoi. streaming e buffer k pathano hobe. tarpor shei buffer theke data te convert kora hobe. toString() use kore UTF-8 encoding apply kore data ana already dekhechi buffer and streaming tutorial e. Tobe ekhn recommended way te dekhbo, encoding use kore.
   //at first, event listener add korbo, req.on("data", func) diye. mane data event hle mane website theke server e data aslei ei callback function invoke hobe. R data to asbe buffer datatype e. Ebar buffer k toString() ebong encoding apply kore data te convert na kore, node.js er recommended way te convert korbo stringDecoder module use kore. Jehetu eta ekta class return kore, mane constructor return kore. Tai age shei class er ekta object baniye nei.

   const decoder = new StringDecoder('utf-8');
   let realData = "";

   //end of variable declaration. Now declare the handlers.

   //check if the requested route from client exists or not. If exists, store reference of the the corresponding request handler function. If not, store reference of the notFoundHandler function.
   const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;

   //now invoke the chosenHandler function: chosenHandler();
   //ekhn chosenHandler to onno ekta module k refer kore ache. shei module e value gulo pete, ei value gulo k function invoke korar somoy parameter hisebe pathiye dite hobe, jate kore, chosenHandler invoke howa mane, refer kora func ta invoke howa r refer kora func ta pass kora parameter(requestProperties) niye e execute hoi. 
   //tar sathe 2nd parameter hisebe chosenHandler k ekta callback function diye deya hocche. ei call back func k handler er vitor theke invoke korte hobe. handler statusCode r payload er value diye ei 2nd parameter e pass kora function k invoke korbe. shei pass kora value er upor depend kore finally response pathano hobe. 
   //place chosenHandler inside the 'end' eventHandler so that we can access realData inside the handler.

   req.on("data", (buffer)=>{
      //convert buffer to data and store
      realData += decoder.write(buffer);
      //console.log('single buffer : ' , buffer); //comma(,) er jaigai plus(+) dile buffer k auto string e convert kore fele.
   });

   //buffer pathano shes hoye gele end event fire kore.
   req.on("end",()=>{
      //decoder er kaj shes. take seta janiye dao. 
      realData += decoder.end();
      //realData filled up. ekhon setake dekhte parbo server e. 
      //console.log(realData);

      //include realData inside requestProperties. so that we can access the data sent by client in the requestProperties to perform processing.
      requestProperties.body = parseJSON(realData);
      //console.log(realData, requestProperties.body);
      //ekhn realData holo, buffer theke stringDecoder use kore UTF-8 encoding kore buffer k string e convert kore save korchilam realData er vitor. kintu operations perform korte amader string theke object e convert korte hobe realData k JSON.parse diye. sejonno durectly object e convert kore requestProperies.body te pathano hocche. Tobe r ekta issue ache. amra user k trust korte parbo na j valid stringified object ba JSON pathabe. seta ensure korte amra utlity function use korechi, parseJSON. 

      //now invoke the chosenHandler function by passing the full requestProperties and the callback function. This callback function will be invoked inside the handler. Here, we have just delcared the function. Inside the handler, the callback function will be invoked with the statusCode depending on the status of execution and the respoce body or content it wants to send to the client. As we can see here, when the handler sends these two values, it attatches statusCode to the responce header and sends the responce (here marked as payload) to the client after stringtifying the responce from object
      chosenHandler(requestProperties, (statusCode, payload) => {
         //check statusCode and payload
          statusCode = typeof statusCode === 'number' ? statusCode : 500;
          payload = typeof payload === 'object' ? payload : {};

          //string e convert kore neya hocche karon, json o communicate korchi amra. object e na.
          const payloadString = JSON.stringify(payload);
          
          //req e jemon client request er sathe header/metadata pathate pare. sevabe, res eo server, responce er sathe kichu header pathiye dite pare client k. by default kichu pathai o, jeta amra postman ei dekhte pai, reponce er sathe. ekhane amra reponce er sathe content-type header add korbo jate client bujhte pare, se server theke ki dhoroner ba format e data pacche. 
          res.setHeader('Content-Type', 'application/json');

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
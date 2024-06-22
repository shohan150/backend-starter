// dependencies
//file system module to work on file system
const fs = require('fs');
//path module to declare in which path the file will be saved.
const path = require('path');

// module scaffolding
const lib = {};

// base directory of the data folder
//kon directory te achi seta sobar age jante hobe __dirname diye. ekhan theke data folder e point korbo.
lib.basedir = path.join(__dirname, '/../.data/');

// write data to file
//create a libraryCreate function jake amra kon directory te file rakhte chai (directory ta kintu basedir er vitore e hobe mane data folder er vitore sub-directory), file er nam, ebong data pass korle corresponding file e write kore dibe. sob shes e, data write kora complete hle, ekta callback e invoke kore dibe. 
lib.create = (dir, file, data, callback) => {
   // open file for writing
   //fs.open opens a file. it takes the path of the file to open. the path to the data folder + subdirectory path passed in the lib.create()function + / + the filname passed to the function. We are assuming .json will not be provided. So, we are adding .json. The, second parameter takes file ta kon e flag e open korte chai. bivinno flag types somporke documentation e details paba, file system flags section e. Ekahen amra 'wx' flag use korbo. This flag ensures that the file is created only if it doesn't already exist. finally ekta callback function which receives two arguments. ekhane error back pattern follow kora hoi. mane first e error nibe. R operation successful hle se ekta fileDescriptior object dei, an integer representing the file descriptor if the file is opened successfully.

   fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
    //if there's no error and a fileDescriptor exists, the code proceeds to write data on the newly opened file. Otherwise, it calls the callback function with an error message. 
       if (!err && fileDescriptor) {
           // convert data to stirng
           // the data sent from client was received as buffer, it was received encded in UTF-8 standard as string datatype. Now, the client can send the data in various formats: like object, array etc. And we will store the data in a json file in the server. To store that data inside server we converted that string into object, array etc. using parseJSON. then, we passed that JSON inside the requestProperties.body. now, that requestProperties is passed to a handler. that handler passes the requestProperties.body to the lib.create 3rd parameter to create that user. now, we'll stringify that data to write and store in a json file. So, in the end, the .json file stors the data in json format or string in vague terms. 

           //----------
           //kintu majhe ei j parse kore, tarpor sting e convert korar lav ta ki? karon -> user request er bosy te data pathanor por, shei data k requestProperties object er vitor body key te rekhe......... eikhane holo khela. rekhe ki kora hoi? directly kintu use kora hoi na. ekta handler k pass kora hoi. ekhn shei handler internally, oisb value er upor bivinno operation kore,tarpor lib.create or others k invoke kore. tahole string ba json hisebe jodi rekhe ditam, ei operation gulo korbe kivabe! jemon, handleReqRes theke userhandler e pathalo. ekhn userHandler er post method, first e check kore provided data gulo thik ache kina. tarpor giye lib.create k invoke kore. tarmane buffer theke normal string e convert theke JSON format e conversion.(assuming client json format ei data pathabe, jate buffer theke normal string e convert kore, JSON.parse dile e, JSON e convert hoye jai. r client sevabe data na pthale to JSON.parse kaj o korbe na r empty object {} return kore dibe parseJSON utility function.) tarpor finally, file e write korar somoy abar JSON hisebe store korchi. ekhane JSON kno abar? direct object na? karon sob gulo module code korar e hobe evabe j tara sobsomy JSON ei data pabe, hok take client request diye invoke kora hok ba db theke data diye invoke kora hok. sob module sobsomoy json data e nibe. 
           //-----------

           const stringData = JSON.stringify(data);
           //console.log(data, stringData);

           //Now, write data to that file using fs.writeFile and then close it. mane file open korlam. shei kaj ta successfully hle se ekta object diye dilo fileDescriptor. Shei fileDescriptor k writeFile korar jonno pass kore dite hobe. jate se bujhte pare kake reference dhorte hobe. 2nd parameter hisebe jei data k write korbe take pathate hobe. finally, shei errorback pattern onujayi, jodi error hoi tahole callback function invoke hobe. 
           fs.writeFile(fileDescriptor, stringData, (err2) => {
               if (!err2) {
                //error na howa mane successfully write korte pereche. tahole ekhn file ta close kore dite hobe. 
                //file close korte fileDescriptor diye reference pass korlam. tarpor error back pattern onujayi, file close korar somoy kono error hle, tar jonno error callback function likhlam.
                   fs.close(fileDescriptor, (err3) => {
                       if (!err3) {
                        //no need to fall into callback hell. Tai ebar error na hle callback k false kore dilo. callback(false); calls the callback function that was passed as an argument to the lib.create function. It's not an internal callback within fs.open, fs.writeFile, or fs.close.This callback is designed to receive information about the file creation process. This gives you flexibility in handling successful and error scenarios in your application. The callback(false); line within lib.create is simply calling the function you provided earlier to inform it of the successful file creation. meaning, it is having no argument, so when called into a handler, we can check that callback is false, then, operation sucessful and proceed to next task in the handler and if callback returns a value like in the later line, then, the handler detects that an error has occured. so, the handler now can invoke the main callback function with statusCode and errorMessage.
                        //explained with example at the bottom. 
                           callback(false);
                       } else {
                           callback('Error closing the new file!');
                       }
                   });
               } else {
                //error howa mane write korte pare ni file e. tobe eta kokhon dekha jabe na karon eta filler value hisebe kaj korche. description niche. 
                   callback('Error writing to new file!');
               }
           });
       } else {
        // if error happens means file could not be opened/created because it already exists. kintu ei callback gulo na kokhono dekha e jabe na userHandler e. karon ki?! ekhane sudhu callback function k ekta argument diye invoke kore deya hocche. kintu funtion ta kothai? funtion ta decalre kora hoyeche userHandler e. sekhane giye checkkorle dekhba j, se, callback e value pass kora hoyeche kina eta check kore callback k notun kore invoke kore. tarmane egulo sudhu valu dicche ekta jate faka/false na thake. ekhane value pele e, userHandler ta nijosso callback k statusCode o errorMessage diye invoke korbe. userHandler e ei pathano error ta print korbe na borong notun error print korbe. 
           callback('There was an error, file may already exists!');
       }
   });
};

// read data from file
//has 3 paramaeters(like a placeholder) or takes 3 argumnets(fixed value). the directory path, file name and callback. ei callback function ta fs.readFile theke pawa error ebong data niye invoke kora ache ekhanei. r callback function ta declare korte hobe jekhane ei lib.read function k invoke kora hobe. tahole hocche ki? lib.read k arguments diye invoke korle, se file read kore ba korar try kore, error o data niye callback k invoke kore dei. ekhn callback ei error ebong data niye ki korbe seta jekhane lib.read k invoke kora hoyeche tar 3rd argument e, error r data argument duita niye declare kore dite hobe. tahole shei declare kora function ta invoke hoye jabe. kintu invoke ta kintu jekhane decalre kora hocche sekane hocche na. invoke hocche lib.read er modde e, sekhane sudhu decalre kora hocche.
lib.read = (dir, file, callback) => {
    //read the file
   fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf8', (err, data) => {
    //callback again in errorback pattern. ager bar referece diyechilo, fileDescription, karon write korchila. ebar read korchi. sejonno se data return korbe. ei data kei callback e pathabo. ebong ekhan theke callback e ja pathabo setai, invoke jekhane kore hoyeche, shei callback pabe. 
       callback(err, data);
   });
};

// update existing file. takes 4 arguments. To update a file we need to perform both read and write operation. 
lib.update = (dir, file, data, callback) => {
   // file open for writing. using r+ flag; allows us to both read and write the file. and if the file does not exist, it will throw an error. 
   fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
       if (!err && fileDescriptor) {
           // convert the data to string
           const stringData = JSON.stringify(data);

           // truncate the file. empties the whole file content.
           fs.ftruncate(fileDescriptor, (err1) => {
               if (!err1) {
                   // write to the file and close it
                   fs.writeFile(fileDescriptor, stringData, (err2) => {
                       if (!err2) {
                           // close the file
                           fs.close(fileDescriptor, (err3) => {
                               if (!err3) {
                                   callback(false);
                               } else {
                                   callback('Error closing file!');
                               }
                           });
                       } else {
                           callback('Error writing to file!');
                       }
                   });
               } else {
                   callback('Error truncating file!');
               }
           });
       } else {
           console.log(`Error updating. File may not exist`);
       }
   });
};

// delete existing file. has 3 parameters.
lib.delete = (dir, file, callback) => {
   // unlink file. mane sohoj kotha e delete kore deya. 
   fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
       if (!err) {
           callback(false);
       } else {
           callback(`Error deleting file`);
       }
   });
};

module.exports = lib;




// function handleSuccess(error) {
//     if (!error) {
//       console.log("File created successfully!");
//     } else {
//       console.error("Error creating file:", error);
//     }
//   }
  
//   // Calling lib.create and passing the handleSuccess function as callback
//   lib.create('data', 'myfile', someData, handleSuccess);

//the handleSuccess function will be called with error set to false (indicating success at the end) after the file creation is complete.
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
//create a libraryCreate function jake amra kon directory te file rakhte chai (directory ta kintu basedir er vitore e hobe mane data fodler er vitore sub-directory), file er nam, ebong data pass korle corresponding file e write kore dibe. sob shes e, data write kora complete hle, ekta callback e invoke kore dibe. 
lib.create = (dir, file, data, callback) => {
   // open file for writing
   //fs.open opens a file. it takes the path of the file to open. the path to the data folder + subdirectory path passed in the lib.create()function + / + the filname passed to the function. We are assuming .json will not be provided. So, we are adding .json. The, second parameter takes file ta kon e flag e open korte chai. bivinno flag types somporke documentation e details paba, file system flags section e. Ekahen amra 'wx' flag use korbo. This flag ensures that the file is created only if it doesn't already exist. finally ekta callback function to open that file which receives two arguments. ekhane error back pattern follow kora hoi. mane first e error nibe. R operation successful hle se ekta fileDescriptior object dei, an integer representing the file descriptor if the file is opened successfully.

   fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
    //if there's no error and a fileDescriptor exists, the code proceeds to write data. Otherwise, it calls the callback function with an error message. 
       if (!err && fileDescriptor) {
           // convert data to stirng
           // the data sent from client was received as buffer, encded in UTF-8 standard and stored inside server. Now, the client can send the data in various formats: like object, array etc. But we will store the data in a json file in the server. So, we have to convert the data in json format using JSON.stringify();
           const stringData = JSON.stringify(data);

           //Now, write data to that file using fs.writeFile and then close it. mane file open korlam. shei kaj ta successfully hle se ekta object diye dilo fileDescriptor. Shei fileDescriptor k writeFile korar jonno pass kore dite hobe. jate se bujhte pare kake reference dhorte hobe. 2nd parameter hisebe jei data k write korbe take pathate hobe. finally, shei errorback pattern onujayi, jodi error hoi tahole callback function invoke hobe. 
           fs.writeFile(fileDescriptor, stringData, (err2) => {
               if (!err2) {
                //error na howa mane successfully write korte pereche. tahole ekhn file ta close kore dite hobe. 
                //file close korte fileDescriptor diye reference pass korlam. tarpor error back pattern onujayi, file close korar somoy kono error hle, tar jonno error callback function likhlam.
                   fs.close(fileDescriptor, (err3) => {
                       if (!err3) {
                        //no need to fall into callback hell. Tai ebar error na hle callback k false kore dilo. callback(false); calls the callback function that was passed as an argument to the lib.create function. It's not an internal callback within fs.open, fs.writeFile, or fs.close.This callback is designed to receive information about the file creation process.
                        //The value of callback is determined by the function you pass as an argument when you call lib.create. This gives you flexibility in handling successful and error scenarios in your application. The callback(false); line within lib.create is simply calling the function you provided earlier to inform it of the successful file creation.
                        //explained with example at the bottom. 
                           callback(false);
                       } else {
                           callback('Error closing the new file!');
                       }
                   });
               } else {
                   callback('Error writing to new file!');
               }
           });
       } else {
           callback('There was an error, file may already exists!');
       }
   });
};

// read data from file
//has 3 paramaeters(like a placeholder) or takes 3 argumnets(fixed value). the directory path, file name and callback. 
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
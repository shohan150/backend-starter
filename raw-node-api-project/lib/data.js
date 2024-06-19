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
   //fs.open opens a file. it takes the path of the file to open. the path to the data folder + subdirectory path passed in the lib.create()function + / + the filname passed to the function. We are assuming .json will not be provided. So, we are adding .json. The, second parameter takes file ta kon e flag e open korte chai. bivinno flag types somporke documentation e details paba, file system flags section e. Ekahen amra wx flag use korbo. finally ekta callback function. ekhane error back pattern follow kora hoi. mane first e error nibe tarpor success hle tar result jar vitor thkbe. Ekhane operation successful hle se ekta fileDescriptior object dei. 
   fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
    //so, jodi error na hoi ebong fileDescriptor thake, tar mane operation successful hoyeche. 
       if (!err && fileDescriptor) {
           // convert data to stirng
           // the data sent from client was received as buffer, encded in UTF-8 standard and stored inside server. Now, the client can send the data in various formats: like object, array etc. But we will store the data in a json file in the server. So, we have to convert the data in json format using JSON.stringify();
           const stringData = JSON.stringify(data);

           // write data to file using fs.writeFile and then close it. mane file open korlam. shei kaj ta successfully hle se ekta object diye dilo fileDescriptor. Shei fileDescriptor k writeFile korar jonno pass kore dite hobe. jate se bujhte pare kake reference dhorte hobe. 2nd parameter hisebe jei data k write korbe take pathate hobe. finally, shei errorback pattern onujayi, jodi error hoi tahole callback function invoke hobe. 
           fs.writeFile(fileDescriptor, stringData, (err2) => {
               if (!err2) {
                //error na howa mane successfully write korte pereche. tahole ekhn file ta close kore dite hobe. 
                //file close korte fileDescriptor diye reference pass korlam. tarpor error back pattern onujayi, error callback function likhlam.
                   fs.close(fileDescriptor, (err3) => {
                       if (!err3) {
                        //no need to fall into callback hell. Tai ebar error na hle callback k false kore dilo mane main callback k false kore dilam, r invoke hbe na. ekahen ei shes. Ig.
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
lib.read = (dir, file, callback) => {
   fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf8', (err, data) => {
       callback(err, data);
   });
};

// update existing file
lib.update = (dir, file, data, callback) => {
   // file open for writing
   fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
       if (!err && fileDescriptor) {
           // convert the data to string
           const stringData = JSON.stringify(data);

           // truncate the file
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

// delete existing file
lib.delete = (dir, file, callback) => {
   // unlink file
   fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
       if (!err) {
           callback(false);
       } else {
           callback(`Error deleting file`);
       }
   });
};

module.exports = lib;
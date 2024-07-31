 // dependencies
const url = require('url');
const http = require('http');
const https = require('https');
const data = require('./data');
const { parseJSON } = require('../helpers/utilities');
const { sendTwilioSms } = require('../helpers/notifications');

// worker object - module scaffolding
const worker = {};

// lookup all the checks
worker.gatherAllChecks = () => {
    // get all the checks. sudhu file er nam gulo pabo. '.json' chara.
    data.list('checks', (err1, checks) => {
        if (!err1 && checks && checks.length > 0) {
            checks.forEach((check) => {
                // read the checkData in each file
                data.read('checks', check, (err2, originalCheckData) => {
                    if (!err2 && originalCheckData) {
                        // pass the data to the check validator
                        worker.validateCheckData(parseJSON(originalCheckData));
                    } else {
                        console.log('Error: reading one of the checks data!');
                    }
                });
            });
        } else {
            console.log('Error: could not find any checks to process!');
        }
    });
};

// validate individual check data
worker.validateCheckData = (originalCheckData) => {
    //redundant. kono functional kaj nai. karon js object notun banabe na, old object er reference niye nibe. just good practice. 
    const originalData = originalCheckData;
    // checkObject e ei 2 ta property asole nai. kintu ami to checking lop e korte thakbo. track to korte hobe. sejonno checkingState; oi link up naki down. seta already deya thakle to seta e thakbe. r na thakle, default url state 'down' rakhlam. For lastChecked. age check na hle lastChecked e kono value e to thakbe na.
    //tahole ekhane mainly check kora hocche, eta ki oi particular check file er first check naki. first check hle ei duita property false diye add kori. r firstcheck na hle ja chilo tai thakbe. ei validation complete hle operation perform e dhukbo. 
    if (originalCheckData && originalCheckData.id) {
        originalData.state =
            typeof originalCheckData.state === 'string' &&
            ['up', 'down'].indexOf(originalCheckData.state) > -1
                ? originalCheckData.state
                : 'down';

        originalData.lastChecked =
            typeof originalCheckData.lastChecked === 'number' && originalCheckData.lastChecked > 0
                ? originalCheckData.lastChecked
                : false;

        // pass to the next process
        worker.performCheck(originalData);
    } else {
        console.log('Error: check was invalid or not properly formatted!');
    }
};

// perform check. mane j url ta deya ache, shei url ta te niye, shei url e hit kore check poreform kore result dite hobe, up naki down.
worker.performCheck = (originalCheckData) => {
    // prepare the initial check outcome
    let checkOutCome = {
        error: false,
        responseCode: false,
    };
    // mark the outcome has not been sent yet. so that multiplr times update na hoi. 
    let outcomeSent = false;

    // parse the hostname & full url from original data.
    //using the default url module of node.js. individually niye tarpor parse korar koron jate format same thake son somoy. nahoi purota user theke ekbare nite gele, ek ek jn bivinno vabe input dibe. keu http/https chara abar query soho input dibe.
    const parsedUrl = url.parse(`${originalCheckData.protocol}://${originalCheckData.url}`, true);
    const hostName = parsedUrl.hostname;
    //pathname querystring bad diye sudhu path ta nei; jeta server e korechi. r ekhane nicche path; jeta querysting o rekhe dibe. karon seta lagbe exact url e hit korte.
    const { path } = parsedUrl;

    // construct the request. etar format erokom e. http/https module use kore request korte hle .request(reqDetails, callback) ei format ei dite hobe. sekhane requestDetails e srequest kothai korbe tar son details bole dite hobe. tarpor req.end() dile http module er maddhome request ta kora hobe. 
    const requestDetails = {
        protocol: `${originalCheckData.protocol}:`,
        hostname: hostName,
        method: originalCheckData.method.toUpperCase(),
        path,
        timeout: originalCheckData.timeoutSeconds * 1000,
    };

    // user kon protocol diyeche tar upor depend kore, node.js er default http ba https module use korte hobe. 
    const protocolToUse = originalCheckData.protocol === 'http' ? http : https;

    //mane jeta hocche http.request(reqDeatils, responceCallback); node er core module us kore request korchi.
    const req = protocolToUse.request(requestDetails, (res) => {
        // grab the status of the response
        const status = res.statusCode;
        // update the check outcome and pass to the next process
        checkOutCome.responseCode = status;
        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    //request define korlam. ekhn send korte hobe. Reuest send korte hobe req.end er maddhome. req=https.-- deya ache. tahole https module er bole tar end() o thakbe. seta dile e tokhon ei request ta oi define kora url tai request korbe ebong wait korbe sekhan theke responce ase kina. tarpor jei responce e asuk positive or error shei responce niye processCheckOutcome() e pathiye dibe. 
    //R request o kintu send hoi buffer hisebe e. To sekhane kono error hle mane, request pathanor somoy e error event hle ei function fire hobe. sekhane error true kore dibo. 
    //ekhn jeta hote pare timeour howar por kono error hote pare, ba error howaar por timeout, ba timeout howar por o request on ache ebong deri te responce asche. sekhte proti situation e 2 ta event listener e kintu fire hoye jabe. tahole 2 bar processCheckOutcome() invoke hobe. tokhon to ei server er db te wrong data update kore dibe. seta atkate hobe. sejonno outcomeSent k rakha hoyeche. j check korbe ei 3 tar moddhe kono event listener on(error, timeout, res) fire hoyeche kina. sudhu ekebare prothome fire howa listener kei processCheckOutcome() k invoke korte dibe. R processCheckOutcome() er vitor checkOutcome k diye deya hoyeche. eta diye processing oi function er vitor processing kora hobe; ekahen sudhu checkOutcome k ebent er vittite define kore dicchi. 
    //event listener gulo declare kora hoye gele, finally req.end() diye request pathai.

    req.on('error', (e) => {
        checkOutCome = {
            error: true,
            value: e,
        };
        // update the check outcome and pass to the next process
        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    //abar r ekta bepar ache. req pathate besi deri hle eo somossa. responce amake url ta up naki down seta pathabe. kintu, besi time nile kintu statuscode r asbe na. kintu timeout ta ki hisebe fire hobe? dekha jak. 
    req.on('timeout', () => {
        checkOutCome = {
            error: true,
            value: 'timeout',
        };
        // update the check outcome and pass to the next process
        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    // req send
    req.end();
};

// save check outcome to database and send to next process
worker.processCheckOutcome = (originalCheckData, checkOutCome) => {
    // check if check outcome is up or down. reponce jodi ase tahole oi url er jonno j j status code k successCode hisebe dhora hoyeche, sudhu segulor modde kono status code hle tokhon 'up' set korbe.
    const state =
        !checkOutCome.error &&
        checkOutCome.responseCode &&
        originalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1
            ? 'up'
            : 'down';

    // decide whether we should alert the user or not. we'll alert the user only when state changes. tahole ei j responce e pawa state r original checkData te thaka state na mila mane state change hoyeche. 
    //tobe ekta edge case ache. ekhn default state to 'down'. tahole first time e url e hit kore up pele jananor kichu nai. karon seta actually change/update na. borong oitai prothom entry. tai lastChecked e kono value na thaka mane etai first check. sekhetre user k alert korar dorkai nai. 
    //pore theke jokhon proti min (1000 * 60) e loop e barbar call kora hote thakbe, tokhon state change hle user k alert korte hobe. 
    const alertWanted = !!(originalCheckData.lastChecked && originalCheckData.state !== state);

    // update the check data
    const newCheckData = originalCheckData;

    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    // update the check to disk
    data.update('checks', newCheckData.id, newCheckData, (err) => {
        if (!err) {
            if (alertWanted) {
                // send the checkdata to next process
                worker.alertUserToStatusChange(newCheckData);
            } else {
                console.log('Alert is not needed as there is no state change!');
            }
        } else {
            console.log('Error trying to save check data of one of the checks!');
        }
    });
};

// send notification sms to user if state changes
worker.alertUserToStatusChange = (newCheckData) => {
    const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${
        newCheckData.protocol
    }://${newCheckData.url} is currently ${newCheckData.state}`;

    sendTwilioSms(newCheckData.userPhone, msg, (err) => {
        if (!err) {
            console.log(`User was alerted to a status change via SMS: ${msg}`);
        } else {
            console.log('There was a problem sending sms to one of the user!');
        }
    });
};

// timer to execute the worker process once per minute
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 1000 * 60);
};

// start the workers
worker.init = () => {
    // execute all the checks one time initially. tarpor proti 6sec por por abar execute korbe.
    worker.gatherAllChecks();

    // call the loop so that checks continue
    worker.loop();
};

// export
module.exports = worker;
// dependencies
const https = require('https');
const querystring = require('querystring');
const { twilio } = require('./environments');

// module scaffolding
const notifications = {};

// send sms to user using twilio api
notifications.sendTwilioSms = (phone, msg, callback) => {
    // input validation
    const userPhone =
        typeof phone === 'string' && phone.trim().length === 11 ? phone.trim() : false;

    const userMsg =
        typeof msg === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600
            ? msg.trim()
            : false;

    if (userPhone && userMsg) {
        // configure the request payload
        const payload = {
            From: twilio.fromPhone,
            To: `+88${userPhone}`,
            Body: userMsg,
        };

        // stringify the payload
        const stringifyPayload = querystring.stringify(payload);

        // configure the request details according to twilio doc. ei format twilio tei paba. twillio te sign in korle accountSid, authToken ta paba. R twilio ektu old type er. se json e data nei na. urlformencoded format e nei (which is a old format of data). tai application/json na hoye application/....form-url-encoded.
        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth: `${twilio.accountSid}:${twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        // instantiate the request object according to twilio doc. request object e amader banano ei requestDetails dite hobe. ebong responce pabo amra. 2nd parameter e ei responce diye callback function likhe dite hobe. responce pawar por, shei value diye ei callback ta execute hoye jabe. 
        const req = https.request(requestDetails, (res) => {
            // get the status of the sent request
            const status = res.statusCode;
            // callback successfully if the request went through
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback(`Status code returned was ${status}`);
            }
        });

        //process chola kalin kono error hle ei function/event listener execute/fire hobe. ei error ta maintainly fire hbe network issue jonito error hle. mane req puropuri communicate hote pare ni. R coding/twilio er error to uporer checking ei dhora porbe.
        req.on('error', (e) => {
            callback(e);
        });

        req.write(stringifyPayload);
        req.end();
    } else {
        callback('Given parameters were missing or invalid!');
    }
};

// export the module
module.exports = notifications;
const fs = require("fs");
const axios = require('axios');
const config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));

exports
  .sendMessage = sendMessage;

function sendMessage(message) {
    if (config.notifications && config.notifications.pushoverToken !== '') {  
        console.log("Sending notification: ", message)      
        axios.post(
            'https://api.pushover.net/1/messages.json',
            {
                token: config.notifications.pushoverToken,
                user: config.notifications.pushoverUser,
                message: message
            }
        )
    }
}
const db = require("./models");
const dotenv = require("dotenv");
const axios = require("axios");
const socketClient = require('./socket-client.js');
// Load environment variables from .env file
async function serverStartAfter() {
    // Only execute if the environment is not 'local'
    if (process.env.APP_ENV != "local") {




        // await db.user.updateMany({}, {
        //     coin: 10,

        // });



    }




}

module.exports = serverStartAfter;
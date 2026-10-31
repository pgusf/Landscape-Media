    const db = require("./models");
    const dotenv = require("dotenv");
    const axios = require("axios");

    // Load environment variables
    dotenv.config();

    // Sleep function to delay execution
    //const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    async function serverStart() {
        // console.log("Waiting for 10 seconds before starting...");
        // await sleep(10000); // Delay for 5 seconds
        console.log("MAINTAIN RESTART SERVER - START");



        console.log("MAINTAIN RESTART SERVER - END");
    }

    module.exports = serverStart;
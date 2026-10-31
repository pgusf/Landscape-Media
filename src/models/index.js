// Import the database configuration from db.config.js file
const dbConfig = require("../config/db.config.js");

// Import Mongoose library for MongoDB interactions
const mongoose = require("mongoose");

// Set Mongoose to use native promises
mongoose.Promise = global.Promise;

// Create an empty object to store database related properties and models
const db = {};

// Assign the Mongoose instance to the db object
db.mongoose = mongoose;

// Set the database URL from the imported dbConfig
db.url = dbConfig.url;

// Import and create the User model using the user.model.js file and Mongoose instance

db.user = require("./user.model.js")(mongoose);
db.product = require("./product.model.js")(mongoose);
db.inquiry = require("./inquiry.model.js")(mongoose);

module.exports = db;

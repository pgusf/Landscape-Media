const dotenv = require('dotenv');
dotenv.config();
const mongoConnectionString = process.env.mongoConnectionString || '';
// MongoDB connection URL configuration
module.exports = {
	url: mongoConnectionString,
};

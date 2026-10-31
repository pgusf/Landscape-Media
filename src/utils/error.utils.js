// Define an error handling middleware function that takes in the error, request, response, and next function
function errorMiddleware(error, req, res, next) {
	let { statuscode = 500, msg, data } = error; // Extract statuscode, msg, and data from the error object

	console.log(`[Error] ${error}`); // Log the error msg

	// If the statuscode code is 500 or there is no msg, change the msg to "Internal server error"
	msg = statuscode === 500 || !msg ? 'Internal server error' : msg;

	// Create an "error" object to be sent in the response, including type, statuscode, msg, and optional data
	error = {
		status: 0,
		statuscode,
		msg,
		...(data && data), // Include data if it exists
	};

	// Set the HTTP statuscode code and send the "error" object as the response
	res.status(statuscode).send(error);
}

module.exports = errorMiddleware; // Export the error handling middleware for use in the application

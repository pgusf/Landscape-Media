// Create a factory function that wraps a middleware function and handles asynchronous errors
const awaitHandlerFactory = (middleware) => {
	return async (req, res, next) => {
		try {
			await middleware(req, res, next); // Execute the wrapped middleware function
		} catch (err) {
			next(err); // Pass any errors to the next middleware in the chain
		}
	};
};

module.exports = awaitHandlerFactory; // Export the awaitHandlerFactory for use in routes

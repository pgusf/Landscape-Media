// Import required modules and libraries
const db = require('../models'); // Import the database models
const httpException = require('../utils/httpException.utils'); // Import a custom HTTP exception handler
const jwt = require('jsonwebtoken'); // Import JSON Web Token library
const dotenv = require('dotenv'); // Import the dotenv library for environment variables
dotenv.config(); // Load environment variables from a .env file

// Create an authentication middleware function that can take roles as parameters
const auth = (...roles) => {
    return async function(req, res, next) {
        try {
            // Get the Authorization header from the request
            const authHeader = req.headers.authorization;
            const bearer = 'Bearer ';

            // Check if the Authorization header exists and starts with 'Bearer '
            if (!authHeader || !authHeader.startsWith(bearer)) {
                // Throw an exception if credentials are missing
                throw new httpException(401, 'Access denied. No credentials sent!');
            }

            // Extract the token from the Authorization header
            const token = authHeader.replace(bearer, '');

            // Get the secret key from environment variables
            const secretKey = process.env.SECRET_JWT || '';

            // Verify the token using the secret key
            const decoded = jwt.verify(token, secretKey);

            // Find the user associated with the decoded token
            const user = await db.user.findOne({
                _id: decoded.userId,
            });

            

            // Throw an exception if the user is not found
            if (!user ) {
                throw new httpException(401, 'Authentication failed!');
            }

           

           

            // Update the last action and increment the number of actions for the user
            await db.user.findByIdAndUpdate(user._id, {
                lastAction: new Date(),
                $inc: {
                    noOfActions: 1
                },
            });

             

            // If the user has the necessary permissions, set the currentUser property on the request and continue to the next middleware or route handler
            req.currentUser = user;
            
            next();
        } catch (e) {
            // Set the status code of the exception to 401 (Unauthorized)
            e.status = 401;
            // Pass the exception to the error handling middleware
            next(e);
        }
    };
};

module.exports = auth; // Export the auth middleware for use in routes
// Define a custom HTTP exception class that extends the built-in Error class
class HttpException extends Error {
    constructor(statuscode, msg, data) {
        super(msg); // Call the constructor of the parent Error class with the provided msg
        this.statuscode = statuscode; // Set the HTTP statuscode code of the exception
        this.msg = msg; // Set the error msg
        this.data = data; // Set additional data associated with the exception
    }
}

module.exports = HttpException; // Export the HttpException class for use in the application
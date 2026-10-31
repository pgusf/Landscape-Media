  // Import required libraries and modules
  const express = require("express"); // Import the Express framework
  const dotenv = require("dotenv"); // Load environment variables from .env file

  dotenv.config(); // Load environment variables from .env file (if present)
  const cors = require("cors"); // Enable CORS (Cross-Origin Resource Sharing)
  const path = require("path"); // Handle file paths

  const db = require("./models"); // Database Setup

  // Import custom HTTP exception utility
  const httpException = require("./utils/httpException.utils");

  // Import common utility functions
  const commonUtils = require("./utils/common.utils");

  // Import internal server error utility
  const errorUtils = require("./utils/error.utils");
  const {
    setGlobalVariable,
    getGlobalVariable,
  } = require("./utils/globalVariable.utils");          
  setGlobalVariable("isServerStarted", 0);
  // Create an Express application
  const app = express();

  // Choose data parsing method based on encryption setting
  if (process.env.IS_ENCRYPT == 1) {
    app.use(express.text()); // If encryption is enabled, expect text data
  } else {
    app.use(express.json()); // If encryption is not enabled, expect JSON data
  }

  // Middleware for handling encryption/decryption

  app.use(cors()); // Enable CORS for all routes
  // app.options("*", cors()); // CORS preflight
  app.use(express.static(path.join(__dirname, "../public"))); // Serve static files from the 'public' directory
  var isDatabaseConnected = 0;
  try {
    // Connect to the database using Mongoose

    console.log(db.url);
    db.mongoose
      .connect(db.url)
      .then(() => {
        console.log("Connected to the database!");
        isDatabaseConnected = 1;
      })
      .catch((err) => {
        console.log("Active Connections:", db.mongoose.connection.readyState);
        console.error("Error connecting to the database:", err);
        process.exit(1); // Terminate the application on database connection failure
      });
  } catch (dbError) {
    console.error("Error initializing the database:", dbError);
    process.exit(1); // Terminate the application on database initialization error
  }

  const port = Number(process.env.PORT || 3000); // Define the server port

  // Define routes for user-related API endpoints
  var version = "1";
  app.use(
    `/api/v` + version + `/user`,
    require("./routes/API/v" + version + "/user.route")
  );

// Handle 404 errors by creating an HTTP exception with a status code of 404 ("Endpoint Not Found")
app.all("/{*splat}", (req, res, next) => {
  const err = new httpException(404, "Endpoint Not Found");
  next(err);
});

// Error handling middleware
app.use(errorUtils);


app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
  setGlobalVariable("isServerStarted", 1);
});  

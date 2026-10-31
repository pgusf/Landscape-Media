const fs = require("fs").promises;
const path = require("path");

const apn = require("apn");
const db = require("../models");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  successRes: function (statuscode, msg) {
    return {
      status: 1,
      statuscode: statuscode,
      msg: msg,
    };
  },
  errorRes: function (statuscode, msg) {
    return {
      status: 0,
      statuscode: statuscode,
      msg: msg,
    };
  },
  listFilesInFolder: async function (folderPath) {
    try {
      const files = await fs.readdir(folderPath);

      // Filter out subdirectories (if any)
      const filePaths = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(folderPath, file);
          const stats = await fs.stat(filePath);

          if (stats.isFile()) {
            return filePath;
          }
          return null;
        })
      );

      // Remove any null entries (directories)
      const filteredFilePaths = filePaths.filter(
        (filePath) => filePath !== null
      );

      // Return the list of file paths
      return filteredFilePaths;
    } catch (err) {
      console.error("Error reading folder:", err);
      throw err; // You can choose to throw the error or handle it as needed
    }
  },

  mergeErrors: function (errors) {
    var mergedErrors = {};

    for (const key in errors) {
      var param = errors[key]["path"];
      var msg = errors[key]["msg"];
      var location = errors[key]["location"];
      if (!mergedErrors[param]) {
        // Initialize the parameter object if it doesn't exist
        mergedErrors[param] = {
          location,
          param,
          msg: [],
        };
      }
      mergedErrors[param].msg.push(msg);
    }
    var returnArray = [];

    for (const key in mergedErrors) {
      returnArray.push({
        param: mergedErrors[key]["param"],
        location: mergedErrors[key]["location"],
        msg: mergedErrors[key]["msg"].join(" | "),
      });
    }

    return returnArray;
  },
  sendToSocket: async function (req, response) {
    const socketSendObject = {
      userId: req.currentUser._id,
      createdUserDeviceId: req.currentUserDevice._id,
      method: this.getRouteMethod(req.originalUrl),
      request: req.body,
      response: response,
      actionTime: Date.now(),
    };
    var insertData = new db.user.action(socketSendObject);
    await insertData.save(); // Save the OTP document to the database
    socketClient.emit("send-data", JSON.stringify(insertData));
  },
  logout: async function (userId, userDeviceId) {
    const insertData = {
      userId: userId,
      userDeviceId: userDeviceId,
    };

    await socketClient.emit("send-data-for-logout", JSON.stringify(insertData));
  },
  sendNotificationToIOS: async function (deviceTokens, message) {
    const options = {
      token: {
        key: "TreuESP.p8", // Path to your .p8 file
        keyId: "W7C6T5H5KN", // Found in Apple Developer portal
        teamId: "2MSXWBL5TS", // Found in Apple Developer portal
      },
      production: false, // Set to true if using production
    };

    const apnProvider = new apn.Provider(options);

    const notification = new apn.Notification();
    notification.topic = "com.MetroGroup.TrueESP"; // Your app's bundle ID
    notification.expiry = Math.floor(Date.now() / 1000) + 3600; // Expire in 1 hour
    notification.alert = message;
    notification.payload = {
      messageFrom: "TreuESP",
    };
    notification.sound = "default";
    notification.badge = 1;

    // Send to multiple devices
    apnProvider
      .send(notification, deviceTokens)
      .then((result) => {
        console.log("Sent:", result.sent);
        console.log("Failed:", result.failed);
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        apnProvider.shutdown();
      });
  },

  sendNotification: async (title, message, playerIds) => {
    if (typeof playerIds === "string") playerIds = [playerIds];
    if (!playerIds || playerIds.length === 0) {
      console.log("No player IDs provided, skipping notification");
      return { success: false, message: "No player IDs provided" };
    }

    const body = {
      app_id: process.env.ONESIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: message },
      include_player_ids: playerIds,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
    };
    try {
      const response = await axios.post(
        "https://onesignal.com/api/v1/notifications",
        body,
        { headers }
      );

      console.log("Notification sent successfully:", response.data.id);
      return { success: true, id: response.data.id };
    } catch (error) {
      console.error(
        "Error sending notification:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  },
};

const express = require("express");
const router = express.Router();
const awaitHandlerFactory = require("../../../middleware/awaitHandlerFactory.middleware");
const auth = require("../../../middleware/auth.middleware");
const path = require("path");
const currentDirPath = __dirname;
const versionFolderName = path.basename(currentDirPath);
const multer = require("multer");
const userController = require("../../../controllers/API/" +
  versionFolderName +
  "/user.controller");

// Manage validation
const userValidator = require("../../../validators/API/" +
  versionFolderName +
  "/user.validator");


router.post(
  "/add-user-inquiry",
  userValidator.addUserInquiry,
  awaitHandlerFactory(userController.addUserInquiry)
);

router.get(
  "/get-user-inquiry",
  awaitHandlerFactory(userController.getUserInquiry)
);

router.get(
  "/delete-user-inquiry",
  awaitHandlerFactory(userController.deleteUserInquiry)
);

module.exports = router;

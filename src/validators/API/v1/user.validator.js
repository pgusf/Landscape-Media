// Import the necessary functions from the express-validator library
const { body, query } = require("express-validator");

// Validator for sending OTP to mobile or email
exports.addUserInquiry = [
  body("howShouldWeMeet")
    .notEmpty()
    .withMessage("How should we meet is required!"),

  body("pickDay")
    .notEmpty()
    .withMessage("Pick day is required!"),

  body("chooseTime")
    .notEmpty()
    .withMessage("Choose time is required!"),

  body("personName")
    .notEmpty()
    .withMessage("Name is required!"),

  body("email")
    .notEmpty()
    .withMessage("Email is required!")
    .isEmail()
    .withMessage("Please enter a valid email address!"),

  body("companyName")
    .notEmpty()
    .withMessage("Company name is required!"),

  body("phone")
    .notEmpty()
    .withMessage("Phone is required!"),

  body("requiredService")
    .notEmpty()
    .withMessage("Required service is required!"),
];


// Validator for sending OTP to mobile or email

// Validator for sending OTP to mobile or email
exports.updateLevel = [
  body("level")
    .exists()
    .withMessage("level is required")

    .isLength({
      min: 1,
    })
    .withMessage("level cannot be empty"),
];

exports.addProduct = [
  body("productName")
    .exists()
    .withMessage("Product name is required"),

  body("category")
    .exists()
    .withMessage("Category is required"),

  body("price")
    .exists()
    .withMessage("Price must be a non-negative number"),

  body("isPriceOnReq")
    .exists()
    .withMessage("isPriceOnReq must be a boolean"),

  body("specification")
    .exists()
    .withMessage("Specification must be an object"),
];
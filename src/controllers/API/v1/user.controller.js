// Import required libraries and modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const db = require("../../../models");
const httpException = require("../../../utils/httpException.utils");
const commonUtils = require("../../../utils/common.utils.js");
var md5 = require("md5");
const { validationResult } = require("express-validator");
 
const axios = require("axios");

// Define a class called UserController
class UserController {
  //

 

 addUserInquiry = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new httpException(400, "Validation failed", {
      errors: commonUtils.mergeErrors(errors.errors),
    });
  }

  try {
    const {
      howShouldWeMeet = "",
      pickDay,
      chooseTime = "",
      personName = "",
      email = "",
      companyName = "",
      phone,
      requiredService,
  
    } = req.body;

    const product = new db.user({
      howShouldWeMeet,
      pickDay,
      chooseTime,
      personName,
      email,
      companyName,
      phone,
      requiredService,
  
    });

    const savedProduct = await product.save();

    const response = commonUtils.successRes(
      201,
      "Product added successfully."
    );

    response.data = savedProduct;

    return res.status(201).send(response);
  } catch (error) {
   if (error.statuscode !== undefined) {
        throw new httpException(error.statuscode, error.msg, error.data);
      } else {
        console.log(error);
        throw new httpException(500, "Something went wrong", {
          errors: error,
        });
      }
  }
};

getUserInquiry = async (req, res, next) => {
  try {
    const inquiries = await db.user.find().sort({ createdAt: -1 });

    const response = commonUtils.successRes(
      200,
      "Inquiries fetched successfully."
    );

    response.data = inquiries;

    return res.status(200).send(response);
  } catch (error) {
    if (error.statuscode !== undefined) {
      throw new httpException(error.statuscode, error.msg, error.data);
    } else {
      console.log(error);
      throw new httpException(500, "Something went wrong", {
        errors: error,
      });
    }
  }
};


  
}
// Export an instance of the UserController class
module.exports = new UserController();

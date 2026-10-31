// Import required libraries and modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const db = require("../../../models");
const fs = require("fs").promises; // Use the promises version of fs
const httpException = require("../../../utils/httpException.utils");
const commonUtils = require("../../../utils/common.utils.js");
var md5 = require("md5");
const { validationResult } = require("express-validator");
 
const axios = require("axios");

// Define a class called UserController
class UserController {
  //

  register = async (req, res, next) => {
    var errors = validationResult(req);

    // Check if there are validation errors
    if (!errors.isEmpty()) {
      errors = commonUtils.mergeErrors(errors.errors);
      throw new httpException(400, "Validation failed", {
        errors: errors,
      });
    } else {
      req.body.email = req.body.email.trim();
      // const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      // // Regular expression to check for a valid mobile (a simple example)
      // if (!emailRegex.test(req.body.email)) {
      //   var errors = [];
      //   errors.push({
      //     location: "body",
      //     path: "email",
      //     msg: ["Invalid email"],
      //   });
      //   errors = commonUtils.mergeErrors(errors);
      //   throw new httpException(422, "Validation failed", {
      //     errors: errors,
      //   });
      // }

      const secretKey = process.env.SECRET_JWT || "";
      // const mSession = await db.mongoose.startSession();

      try {
        //  await mSession.startTransaction();
        /// BATCH PROCESS START

        var isExistUser = await db.user.findOne({
          email: req.body.email,
        });

        if (isExistUser) {
          var errors = [];
          errors.push({
            location: "body",
            path: "email",
            msg: [
              "The email is already associated with an existing account. Please try using a different email.",
            ],
          });
          errors = commonUtils.mergeErrors(errors);
          throw new httpException(422, "Validation failed", {
            errors: errors,
          });
        }

        // SEND OTP TO EMAIL
        // await commonUtils.sendOTPToEmail(req.body.email_or_mobile, otp);

        var password = md5(req.body.password);
        let isUserAvailable = new db.user({
          name: req.body.name,
          phone: req.body.phone,
          email: req.body.email,
          address: req.body.address,
          companyName: req.body.companyName,
          IsCompanyPrivate: req.body.IsCompanyPrivate,
          password: password,
          city: req.body.city,
          state: req.body.state,
          country: req.body.country,  
          lastLogin: new Date(),
          // cityId: req.body.cityId,
        });
        await isUserAvailable.save();

        var response = commonUtils.successRes(201, "Successfully registered.");

        response["data"] = isUserAvailable;

        res.status(response["statuscode"]).send(response);

        // await mSession.commitTransaction();
      } catch (error) {
        //   await mSession.abortTransaction();
        if (error.statuscode !== undefined) {
          throw new httpException(error.statuscode, error.msg, error.data);
        } else {
          throw new httpException(500, "Something went wrong", {
            errors: error,
          });
        }
      } finally {
        //await mSession.endSession();
      }
    }
  };

  login = async (req, res, next) => {
    var errors = validationResult(req);

    // Check if there are validation errors
    if (!errors.isEmpty()) {
      errors = commonUtils.mergeErrors(errors.errors);
      throw new httpException(400, "Validation failed", {
        errors: errors,
      });
    } else {
      //const mSession = await db.mongoose.startSession();
      // console.log("secret key time executed:  ", 1);

      
      const secretKey = process.env.SECRET_JWT || "";

      try {
        //   await mSession.startTransaction();
        /// BATCH PROCESS START
        var isExistUser = await db.user.findOne({
          email: req.body.email,
        });

        // console.log("Check existing USer executed:  ", 2);

        //.session(mSession);

        if (isExistUser) {
          var password = md5(req.body.password);
          if (password == isExistUser.password) {
            await db.user.findByIdAndUpdate(isExistUser._id, {
              lastLogin: new Date(),
            });

            const expiresIn = 24 * 30 * 365 * 2;
            var token = jwt.sign(
              {
                userId: isExistUser._id,
              },
              secretKey,
              {
                expiresIn: expiresIn + "h",
              }
            );

            var response = commonUtils.successRes(200, "Successfully login.");
            response["token"] = token;
            response["data"] = isExistUser;
            res.status(response["statuscode"]).send(response);
            //await mSession.commitTransaction();
          } else {
            var errors = [];
            errors.push({
              location: "body",
              path: "email",
              msg: [
                "The password entered is incorrect. Please recheck and try again.",
              ],
            });
            errors = commonUtils.mergeErrors(errors);
            throw new httpException(422, "Validation failed", {
              errors: errors,
            });
          }
        } else {
          var errors = [];
          errors.push({
            location: "body",
            path: "email",
            msg: [
              "The email is not associated with any account. Please recheck the email and try again.",
            ],
          });
          errors = commonUtils.mergeErrors(errors);
          throw new httpException(422, "Validation failed", {
            errors: errors,
          });
        }
      } catch (error) {
        //  await mSession.abortTransaction();
        if (error.statuscode !== undefined) {
          throw new httpException(error.statuscode, error.msg, error.data);
        } else {
          throw new httpException(500, "Something went wrong", {
            errors: error,
          });
        }
      } finally {
        // await mSession.endSession();
      }
    }
  };

  forgetPassword = async (req, res, next) => {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      throw new httpException(400, "Validation failed", {
        errors: {
          email: ["Email is required and must be a string."],
        },
      });
    }

    try {
      const user = await db.user.findOne({ email: email.trim() });

      if (!user) {
        throw new httpException(404, "User not found", {
          errors: {
            email: [
              "The email address you entered is not registered with us. Please use the email you used during registration.",
            ],
          },
        });
      }

      // 1. Generate new random password
      const newPassword = Math.random().toString(36).slice(-8); // e.g., 8-char string
      //Math.random(); // 👉 0.84357648267394
      //Math.random().toString(36); // 👉 "0.ixz9q7a4e"
      //"0.ixz9q7a4e".slice(-8); // 👉 "z9q7a4e" (pick last 8 char)

      // 2. Update user's password in DB (after hashing)
      const hashedPassword = md5(newPassword);
      await db.user.findByIdAndUpdate(user._id, {
        password: hashedPassword,
      });

      // 3. Send the email
      const emailResponse = await axios.post(
        "http://localhost:3133/send-email",
        {
          email: user.email,
          subject: "Your New Password",
          body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; background-color: #f9f9f9;">
            <h2 style="color: #333;">🔒 Password Reset</h2>
            <p>Hello ${user.fullname || "User"},</p>
            <p>Your new password is:</p>
            <div style="background-color: #e8f0fe; padding: 15px; border-radius: 8px; font-size: 18px; color: #111; font-weight: bold; text-align: center;">
              ${newPassword}
            </div>
            <p style="margin-top: 20px;">Please login and change your password immediately.</p>
            <hr style="margin: 30px 0;">
            <p style="font-size: 12px; color: #999;">This is an automated message. Do not reply.</p>
          </div>
        `,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      var response = commonUtils.successRes(
        200,
        "A new password has been sent to your email. Please check your inbox to log in to your account."
      );
      res.status(response["statuscode"]).send(response);
    } catch (error) {
      if (error.statuscode !== undefined) {
        throw new httpException(error.statuscode, error.msg, error.data);
      } else {
        throw new httpException(500, "Something went wrong", {
          errors: error,
        });
      }
    }
  };

  changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new httpException(400, "Validation failed", {
        errors: {
          oldPassword: !oldPassword ? ["Old password is required."] : undefined,
          newPassword: !newPassword ? ["New password is required."] : undefined,
        },
      });
    }

    try {
      const user = await db.user.findById(req.currentUser._id);
      if (!user) {
        throw new httpException(404, "User not found!");
      }
      console.log("Old Password", md5(oldPassword));
      if (md5(oldPassword) !== user.password) {
        throw new httpException(400, "Old password is incorrect", {
          errors: { oldPassword: ["Old Password is incorrect"] },
        });
      }

      user.password = md5(newPassword);
      await user.save();

      var response = commonUtils.successRes(
        200,
        "Password changed successfully."
      );

      res.status(response["statuscode"]).send(response);
    } catch (error) {
      if (error.statuscode !== undefined) {
        throw new httpException(error.statuscode, error.msg, error.data);
      } else {
        throw new httpException(500, "Something went wrong", {
          errors: error,
        });
      }
    }
  };

  saveUserDeviceInfo = async (userId, req) => {
    const clientIP = req.connection.remoteAddress;

    const isUserDeviceAvailable = new db.user.device({
      userId: userId,
      ipAddress: clientIP,
      appVersion: req.body.appVersion || "",
      deviceInfo: req.body.deviceInfo || "",
      osName: req.body.osName || "",
      osVersion: req.body.osVersion || "",
      macAddress: req.body.macAddress || "",
    });

    await isUserDeviceAvailable.save();

    return isUserDeviceAvailable;
  };

  profile = async (req, res, next) => {
    var response = commonUtils.successRes(200, "profile");
    response["data"] = req.currentUser;

    //  await mSession.commitTransaction();
    res.status(response["statuscode"]).send(response);
  };

  logout = async (req, res, next) => {
    var errors = validationResult(req);

    // Check if there are validation errors
    if (!errors.isEmpty()) {
      errors = commonUtils.mergeErrors(errors.errors);
      throw new httpException(400, "Validation failed", {
        errors: errors,
      });
    } else {
      //const mSession = await db.mongoose.startSession();
      try {
        //  await mSession.startTransaction();
        /// BATCH PROCESS START

        await db.user.device.findByIdAndUpdate(req.currentUserDevice._id, {
          isLogout: true,
          notificationToken: "",
        });

        await db.user.findByIdAndUpdate(req.currentUserDevice._id, {
          oneSignalToken: null,
        });

        var response = commonUtils.successRes(200, "Successfully logout");

        //  await mSession.commitTransaction();
        res.status(response["statuscode"]).send(response);
      } catch (error) {
        // await mSession.abortTransaction();
        if (error.statuscode !== undefined) {
          throw new httpException(error.statuscode, error.msg, error.data);
        } else {
          throw new httpException(500, "Something went wrong", {
            errors: error,
          });
        }
      } finally {
        // await mSession.endSession();
      }
    }
  };

  delete = async (req, res, next) => {
    var errors = validationResult(req);

    // Check if there are validation errors
    if (!errors.isEmpty()) {
      errors = commonUtils.mergeErrors(errors.errors);
      throw new httpException(400, "Validation failed", {
        errors: errors,
      });
    } else {
      //const mSession = await db.mongoose.startSession();
      try {
        //  await mSession.startTransaction();
        /// BATCH PROCESS START

        await db.user.device.deleteMany({
          userId: req.currentUser._id,
        });
        await db.user.deleteOne({
          _id: req.currentUser._id,
        });

        var response = commonUtils.successRes(
          200,
          "Successfully deleted account"
        );

        //  await mSession.commitTransaction();
        res.status(response["statuscode"]).send(response);
      } catch (error) {
        // await mSession.abortTransaction();
        if (error.statuscode !== undefined) {
          throw new httpException(error.statuscode, error.msg, error.data);
        } else {
          throw new httpException(500, "Something went wrong", {
            errors: error,
          });
        }
      } finally {
        // await mSession.endSession();
      }
    }
  };

  googleLogin = async (req, res, next) => {
    const secretKey = process.env.SECRET_JWT || "";
    try {
      const googleResponse = await axios.get(
        "https://oauth2.googleapis.com/tokeninfo?id_token=" +
          req.body.access_token
      );
      console.log("google response", googleResponse.data);
      req.body.email = googleResponse.data.email;
      req.body.fullname =
        googleResponse.data.given_name + " " + googleResponse.data.family_name;

      req.body.providerId = googleResponse.data.sub;

      var isExistUser = await db.user.findOne({
        email: req.body.email,
      });
      let token;
      if (isExistUser) {
        await db.user.findByIdAndUpdate(isExistUser._id, {
          lastLogin: new Date(),
        });

        var isExistUser = await db.user.findById(isExistUser._id);

        const expiresIn = 24 * 30 * 365 * 2;
        token = jwt.sign(
          {
            userId: isExistUser._id,
          },
          secretKey,
          {
            expiresIn: expiresIn + "h",
          }
        );
      }

      const password = md5(req.body.providerId + process.env.SECRET_JWT || "");
      let isUserAvailable = new db.user({
        fullname: req.body.fullname,
        provider: "google",
        providerId: req.body.providerId,
        email: req.body.email,
        password: password,
        lastLogin: new Date(),
      });

      await isUserAvailable.save();
      var isExistUser = await db.user.findById(isUserAvailable._id);

      const expiresIn = 24 * 30 * 365 * 2;
      token = jwt.sign(
        {
          userId: isExistUser._id,
        },
        secretKey,
        {
          expiresIn: expiresIn + "h",
        }
      );

      var response = commonUtils.successRes(200, "Successfully login.");
      response["token"] = token;
      response["data"] = isExistUser;
      res.status(response["statuscode"]).send(response);
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

  facebookLogin = async (req, res, next) => {
    const secretKey = process.env.SECRET_JWT || "";
    try {
      const { access_token } = req.body;
      if (!access_token)
        throw new httpException(400, "Missing Facebook access token");
      const fbResponse = await axios.get(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${access_token}`
      );

      const { id: providerId, email, name: fullname } = fbResponse.data;

      if (!email) {
        throw new httpException(400, "Email not provided by Facebook");
      }

      let user = await db.user.findOne({ email });

      if (user) {
        await db.user.findByIdAndUpdate(user._id, { lastLogin: new Date() });
      }

      const password = md5(providerId + process.env.SECRET_JWT || "");

      user = new db.user({
        fullname,
        provider: "facebook",
        providerId,
        email,
        password,
        lastLogin: new Date(),
      });

      await user.save();

      const expiresIn = 24 * 30 * 365 * 2;
      const token = jwt.sign(
        {
          userId: user._id,
        },
        secretKey,
        {
          expiresIn: expiresIn + "h",
        }
      );

      const response = commonUtils.successRes(200, "Successfully login.");
      response["token"] = token;
      response["data"] = user;
      res.status(response["statuscode"]).send(response);
    } catch (error) {}
  };

  loginWithApple = async (req, res, next) => {
    var errors = validationResult(req);

    // Check if there are validation errors
    if (!errors.isEmpty()) {
      errors = commonUtils.mergeErrors(errors.errors);
      throw new httpException(400, "Validation failed", {
        errors: errors,
      });
    } else {
      //const mSession = await db.mongoose.startSession();
      const secretKey = process.env.SECRET_JWT || "";

      try {
        //   await mSession.startTransaction();
        /// BATCH PROCESS START

        var token = req.body.access_token;

        const jwtParts = token.split(".");
        const payloadEncoded = jwtParts[1];

        // Decode JWT payload
        const payloadBuffer = Buffer.from(payloadEncoded, "base64");
        const jwtPayload = JSON.parse(payloadBuffer.toString("utf8"));

        // Check issuer
        if (jwtPayload.iss !== "https://appleid.apple.com") {
          var errors = [];
          errors.push({
            location: "body",
            path: "access_token",
            msg: ["Token was not issued by Apple"],
          });
          errors = commonUtils.mergeErrors(errors);
          throw new httpException(422, "Validation failed", {
            errors: errors,
          });
        }

        // Check audience (client ID)
        if (jwtPayload.aud !== "com.telepathy.mindgames") {
          var errors = [];
          errors.push({
            location: "body",
            path: "token",
            msg: ["Token was not issued for the correct client ID"],
          });
          errors = commonUtils.mergeErrors(errors);
          throw new httpException(422, "Validation failed", {
            errors: errors,
          });
        }

        const exp = jwtPayload.exp;
        const currentTime = Math.floor(Date.now() / 1000);

        if (currentTime >= exp) {
          var errors = [];
          errors.push({
            location: "body",
            path: "token",
            msg: ["Token has expired"],
          });
          errors = commonUtils.mergeErrors(errors);
          throw new httpException(422, "Validation failed", {
            errors: errors,
          });
        }

        if (jwtPayload.error && jwtPayload.error !== "") {
          var errors = [];
          errors.push({
            location: "body",
            path: "token",
            msg: ["Invalid oauth2 from Apple"],
          });
          errors = commonUtils.mergeErrors(errors);
          throw new httpException(422, "Validation failed", {
            errors: errors,
          });
        }

        const email = jwtPayload.email || "";

        req.body.email = email;
        req.body.firstname = req.body.firstname
          ? req.body.firstname
          : "Telepathy";
        req.body.lastname = req.body.lastname ? req.body.lastname : "Master";
        req.body.providerId = jwtPayload.sub;

        var isExistUser = await db.user.findOne({
          email: req.body.email,
          type: 1,
        });

        if (!isExistUser) {
          isExistUser = await db.user.findOne({
            loginId: req.body.providerId,
            type: 1,
          });
        }
        //.session(mSession);

        if (isExistUser) {
          await db.user.findByIdAndUpdate(isExistUser._id, {
            loginId: req.body.loginId,
            lastLogin: new Date(),
          });

          var isExistUser = await db.user.findById(isExistUser._id);

          var userDevice = await this.saveUserDeviceInfo(isExistUser._id, req);

          var extraDevices = await db.user.device
            .find({
              _id: {
                $ne: userDevice._id,
              },
              userId: isExistUser._id,
            })
            .sort({
              updatedAt: -1,
            })
            .select("_id createdAt");

          for (let index = 0; index < extraDevices.length; index++) {
            await db.user.device.findByIdAndUpdate(extraDevices[index]._id, {
              isLogout: true,
              isForceLogout: true,
              logoutDateTime: new Date(),
              notificationToken: "",
            });

            await commonUtils.logout(isExistUser._id, extraDevices[index]._id);
          }

          const expiresIn = 24 * 30 * 365 * 2;
          var token = jwt.sign(
            {
              userId: isExistUser._id,
              userDeviceId: userDevice._id,
            },
            secretKey,
            {
              expiresIn: expiresIn + "h",
            }
          );
        } else {
          var password = md5("Enc0dew0rk");
          var username = await commonUtils.generateCoolUsername();

          const clientIP =
            req.headers["x-forwarded-for"] ||
            req.headers["x-real-ip"] ||
            req.ip;
          const cleanIP = clientIP.replace(/^::ffff:/, "");
          var countryCode = "US";

          const geo = geoip.lookup(cleanIP);
          console.log(cleanIP);
          console.log(geo);

          if (geo) {
            countryCode = geo.country;
          }
          var country = await db.country.findOne({
            code: countryCode,
          });

          var countryId = "";
          if (country) {
            countryId = country._id;
          } else {
            var country = await db.country.findOne({
              code: "US",
            });
            countryId = country._id;
          }

          let isUserAvailable = new db.user({
            username: username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            type: 1,
            loginType: 1,
            loginId: req.body.loginId,
            email: req.body.email,
            password: password,
            countryId: countryId,
          });

          await isUserAvailable.save();

          var isExistUser = await db.user.findById(isUserAvailable._id);

          await db.user.findByIdAndUpdate(isExistUser._id, {
            lastLogin: new Date(),
          });

          var userDevice = await this.saveUserDeviceInfo(isExistUser._id, req);

          var extraDevices = await db.user.device
            .find({
              _id: {
                $ne: userDevice._id,
              },
              userId: isExistUser._id,
            })
            .sort({
              updatedAt: -1,
            })
            .select("_id createdAt");

          for (let index = 0; index < extraDevices.length; index++) {
            await db.user.device.findByIdAndUpdate(extraDevices[index]._id, {
              isLogout: true,
              isForceLogout: true,
              logoutDateTime: new Date(),
              notificationToken: "",
            });

            await commonUtils.logout(isExistUser._id, extraDevices[index]._id);
          }

          const expiresIn = 24 * 30 * 365 * 2;
          var token = jwt.sign(
            {
              userId: isExistUser._id,
              userDeviceId: userDevice._id,
            },
            secretKey,
            {
              expiresIn: expiresIn + "h",
            }
          );
        }

        var response = commonUtils.successRes(200, "Successfully login.");
        response["token"] = token;
        response["data"] = isExistUser;
        res.status(response["statuscode"]).send(response);
      } catch (error) {
        //  await mSession.abortTransaction();
        if (error.statuscode !== undefined) {
          throw new httpException(error.statuscode, error.msg, error.data);
        } else {
          throw new httpException(500, "Something went wrong", {
            errors: error,
          });
        }
      } finally {
        // await mSession.endSession();
      }
    }
  };


  getZipPhrase = async (req, res, next) => {
    var errors = validationResult(req);

    // Check if there are validation errors
    if (!errors.isEmpty()) {
      errors = commonUtils.mergeErrors(errors.errors);
      throw new httpException(400, "Validation failed", {
        errors: errors,
      });
    } else {
      try {
        //  await mSession.startTransaction();
        /// BATCH PROCESS START

        var getZipValue = await db.phrase.find({});

        var data = [];

        getZipValue.forEach((element) => {
          data.push({
            zipName: element.zipName,
            phraseValue: element.phraseValue,
            zipPhraseID: element.zipPhraseID,
          });
        });

        var response = commonUtils.successRes(
          200,
          "Phrase values have been fetched successfully."
        );

        response["data"] = data;

        res.status(response["statuscode"]).send(response);
      } catch (error) {
        //   await mSession.abortTransaction();
        if (error.statuscode !== undefined) {
          throw new httpException(error.statuscode, error.msg, error.data);
        } else {
          throw new httpException(500, "Something went wrong", {
            errors: error,
          });
        }
      } finally {
        //await mSession.endSession();
      }
    }
  };

}
// Export an instance of the UserController class
module.exports = new UserController();

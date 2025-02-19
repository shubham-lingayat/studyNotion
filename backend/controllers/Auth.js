const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    // fetch email from request body
    const { email } = req.body;

    // check if user already exists
    const checkUserPresent = await User.findOne({ email });

    // if user already exists, then return response
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already registered",
      });
    }

    // generate OTP
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP Generated: ", otp);

    // Check Unique OTP or Not
    let result = await OTP.findOne({ otp: otp });
    // run loop until we get unique OTP
    while (result) {
      otp = otpGenerator(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };

    // Create an Entry in DB for OTP
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    // return response successful
    return res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
      otp,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Can't send OTP Server Error, try again later",
    });
  }
};

// SignUp
exports.signUp = async (req, res) => {
  try {
    // fetch data from user requset body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    // Validate the data
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !conatctNumber ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }
    // match the 2 password - ('password' and 'confirm passwword')
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password is not matched with confirm password",
      });
    }

    // Check user already exist or not
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already exists",
      });
    }

    // find most recent OTP from the database for the same user
    const recentOTP = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOTP);

    // validate the OTP
    if (recentOTP.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found!",
      });
    }

    if (otp !== recentOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Hash the Password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create Entry in DataBase
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      accountType,
      contactNumber,
      password: hashedPassword,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    // return response
    return res.status(200).json({
      success: true,
      message: "Entry Created Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "not able to register user, server error",
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    // get data from request body
    const { email, password } = req.body;
    // validate the data
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the details!",
      });
    }

    // user check exists or not
    const user = await User.findOne({ email }).populate("additionaldetails");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered, please Signup first",
      });
    }

    // generate JWT, after password matching
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        role: user.role,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;

      // create Cookie - expire in 3 days
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is Incorrect",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server Error, not able to Login",
    });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    // Fetch data from req body
    const { email, oldPassword, newPassword, confirmPassword } = req.body;
    // validation on data
    if ((!email, !oldPassword || !newPassword || !confirmPassword)) {
      return res.status(401).json({
        success: false,
        message: "Please all the details",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "new password Doesn't match with confirm password",
      });
    }

    if (newPassword === oldPassword) {
      return res.status(401).json({
        success: false,
        message: "new password and old password can not be same!",
      });
    }

    // Verify Password from database with user entered password
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found in DB");
      return res.status(401).json({
        success: false,
        message: "User doesn't exists!",
      });
    }

    const storedHashedPassword = user.password;
    // using compare function
    bcrypt.compare(oldPassword, storedHashedPassword, (err, result) => {
      if (err) {
        // Handle error
        console.error("Error comparing passwords:", err);
        return res.status(401).json({
          success: false,
          message:
            "Server Error, occurred when comparing password with database",
        });
      }

      if (result) {
        // Passwords match, authentication successful
        console.log("Passwords match! User authenticated.");
      } else {
        // Passwords don't match, authentication failed
        console.log("Passwords do not match! Authentication failed.");
        return res.status(401).json({
          success: false,
          message: "Password doesn't match",
        });
      }
    });

    // Hash the Password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    // update password in dataBase
    await user.save();
    console.log("Password Updated Successfully!");

    // send mailn ----------------------------------

    // return resposne
    return res.status(200).json({
      success: true,
      message: "Password Updated Successfully",
    });
  } catch (erorr) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error, not able to update password",
    });
  }
};

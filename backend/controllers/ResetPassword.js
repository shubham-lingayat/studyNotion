const User = require("../models/User");
const mailSender = require("../utils/mailSender");

// Reset Password Token
exports.resetPasswordToken = async (req, res) => {
  try {
    // Get email from req body
    const email = req.body.email;
    // check user for this email, email validation
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your Email is not registered!",
      });
    }
    // generate token- using built-in function
    const token = crypto.randomUUID();
    // update user by adding token and expiretion time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );

    // create url
    const url = `http://localhost:3000/update-password/${token}`;

    // send mail containing the url
    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link: ${url}`
    );
    // return response
    return res.status(200).json({
      success: true,
      message: "Paasword reset mail sended successfully!",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while reseting password",
    });
  }
};

// Rset password After user click on LINK received in mail 
exports.resetPassword = async (req, res) => {
  try {
    // data fetch from req.body
    // get the token
    // Validation
    // Get the user details using Token from database
    // If user not found return
    // Token time check if it is expired
    // hash the password
    // Make entry in DB for the new password
    // return response
  } catch (err) {}
};

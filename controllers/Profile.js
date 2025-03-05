const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  try {
    // get data
    const { dataOfBirth = "", about = "", contactNumber, gender } = req.body;
    // get userId
    const id = req.user.id;
    // validation
    if (!contactNumber || !gender || !id) {
      return res.status(401).json({
        success: true,
        message: "All fields are mandetory",
      });
    }
    // find Profile
    // profile id is mentioned inside user -> additional details id == profile id
    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);
    // Update Profile - Data in DB
    // Reason - Object is already defined (i.e. DB already contains null data for the following that's why we no need to use create method of mongoDB)
    profileDetails.dateOfBirth = dataOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;
    await profileDetails.save();
    // return response
    return res.status(200).json({
      success: true,
      message: "Profile Details Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error, while Creating Profile",
    });
  }
};

// delete Account
exports.deleteAccount = async (req, res) => {
  try {
    // get Id
    const id = req.user.id;
    // validation
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "User is not logged in, Id not found",
      });
    }

    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }
    // Delete Profile of User - First we delete Profile then delete User
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    // TODO: Unenroll user from all enrolled courses
    // Delete User
    await User.findByIdAndDelete({ _id: id });

    // return response
    return res.status(200).json({
      success: true,
      message: "Account Deleted Successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// get All User details
exports.getAllUserDetails = async (req, res) => {
  try {
    // get id
    const id = req.user.id;
    // validation
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "user id not found",
      });
    }
    // userdetails -> populate additional Details of user (profile details)
    userDetails = await User.findById(id).populate("additionalDetails").exec();
    // validation
    if (!userDetails) {
      return res.status(401).json({
        success: false,
        message: "User Not Found",
      });
    }
    // return response
    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status.json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

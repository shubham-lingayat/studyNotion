const Course = require("../models/Course");
const categories = require("../models/categories");
const User = require("../models/User");
const {
  uploadFileToCloudinary,
  uploadImageToCloudinary,
} = require("../utils/imageUploader");

// createCourse Handler
exports.createCourse = async (req, res) => {
  try {
    // Data fetch
    const { courseName, courseDecsription, whatYouWillLearn, price, category } =
      req.body;
    // file fetch
    const thumbnail = req.files.thumbnailImage;
    // data validation
    if (
      !courseName ||
      !courseDecsription ||
      !whatYouWillLearn ||
      !price ||
      !category ||
      !thumbnail
    ) {
      return res.status(401).json({
        success: false,
        message: "All fields are mandetory to fill",
      });
    }
    // Instructor validation
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("Instructor Details: ", instructorDetails);

    if (!instructorDetails) {
      return res.status(401).json({
        success: false,
        message: "Instructor is not found in Database",
      });
    }

    // category validation
    const categoryDetails = await categories.findById(category);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "category details not found",
      });
    }
    // Image upload to cloudinary
    const thumbnailImageURL = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );
    // create course entry in DB
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      price,
      category: categoryDetails._id,
      thumbnail: thumbnailImageURL,
    });
    // create course entry in User Schema - For Instructor
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );
    // create course entry in category
    await categories.findByIdAndUpdate(
      { _id: categoryDetails._id },
      {
        $push: {
          course: newCourse._id,
        },
      },
      { new: true }
    );
    // return resposne
    return res.status(200).json({
      success: true,
      message: "Course Created Successfully",
    });
  } catch (err) {
    console.log(err);
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error, can not create Course",
    });
  }
};

// get All courses handler -----------------------------
exports.showAllCourses = async (req, res) => {
  try {
    // find all courses from DB
    // const allCourses = await Course.find({});
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReview: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec();

    // return response
    return res.status(200).json({
      success: true,
      message: "All the Courses fetched successfully",
      data: allCourses,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error, Not able to fetch all data",
    });
  }
};

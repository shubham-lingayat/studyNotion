const RatingAndReview = require("../models/RatingAndReviews");
const Course = require("../models/Course");

// create Rating
exports.createRating = async (req, res) => {
  try {
    // get user id
    const userId = req.user.id;

    // fetch data from user body
    const { rating, review, courseId } = req.body;

    // check if user is enrolled or not
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMtach: { $eq: userId } },
    });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "User is not enrolled in course",
      });
    }

    // check if review is already exists by the same user
    const alreadyReviewd = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });

    // create Rating and Review
    if (alreadyReviewd) {
      return res.status(403).json({
        success: false,
        message: "User Review alredy exists",
      });
    }

    // Update Course with this review
    const ratingAndReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });

    // Update the course with the rating and review
    await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReview: ratingAndReview._id,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Review is created successfully",
      data: ratingAndReview,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// get Average Rating
exports.getAverageRating = async (req, res) => {
  try {
    // Get Course Id
    const courseId = req.body.courseId;
    // Calculate average rating
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
    ]);
    // return rating
  } catch (err) {}
};

// get All rating

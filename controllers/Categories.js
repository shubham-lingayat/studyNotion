const category = require("../models/categories");

// Create category Handler -----------------
exports.createcategory = async (req, res) => {
  try {
    // fetch data
    const { name, description } = req.body;
    // validation
    if (!name || !description) {
      return res.status(401).json({
        success: false,
        message: "Plese fill all the details",
      });
    }
    // create entry in DB
    const categoryDetails = await category.create({
      name: name,
      description: description,
    });

    console.log(categoryDetails);

    return res.status(200).json({
      success: true,
      message: "category Created Successfully!",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error, Can not create category",
    });
  }
};

// Get all categories Handler -----------------
exports.showAllcategories = async (req, res) => {
  try {
    // find category from database
    const allcategories = await category.find(
      {},
      { name: name, description: description }
    );

    console.log(allcategories);
    // return resposne
    return res.status(200).json({
      success: true,
      message: "All categories fetched successfully!",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error, Can not get all categories",
    });
  }
};

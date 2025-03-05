const mongoose = require("mongoose");

const categoriesSchema = new mongoose.Schema({
  name: {
    tyep: String,
    required: true,
    trim: true,
  },
  discription: {
    type: String,
  },
  courses:[
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
		},
	],
});

module.exports = mongoose.Schema("category", categoriesSchema);

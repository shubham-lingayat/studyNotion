const mongoose = require('mongoose');

const tagsSchema = new mongoose.Schema({
    name: {
        tyep:String,
        required: true,
        trim: true,
    },
    discription:{
        type:String,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    }
})

module.exports = mongoose.Schema("Tag", tagsSchema);
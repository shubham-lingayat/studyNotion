const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp: {
        type: String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires: 5*60,
    }
})

// must written before module export
// a Function -> to send Mails
async function sendVerificationEmail(email, otp){
    try{
        const mailResponse = await mailSender(email, "Verification Email From StudyNotion", otp);
        console.log("Email Send Successfully!", mailResponse);
    }
    catch(error){
        console.log("Error occured when sending mail");
        console.error(error);
        throw error;
    }
}

// Pre-middleware
OTPSchema.pre("save", async function(next){
    await sendVerificationEmail(this.email, this.otp);
})


module.exports = mongoose.model("OTP", OTPSchema);
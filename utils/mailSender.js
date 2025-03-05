const nodemailer = require("nodemailer");

// DataTransferItemList  - used as an function parameter
const mailSender = async (email, title, body) => {
  try {
    // need to create Transporter First to send mail
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // message data
    let info = await transporter.sendMail({
      from: "StudyNotion || Shubham Lingayat",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });

    console.log(info);
    return info;
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = mailSender;

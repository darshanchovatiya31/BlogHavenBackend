const { ErrorHandler } = require("../../middleware/errorHandler");
const { StatusCodes } = require("http-status-codes");
const User = require("../../model/User/User");
const bcrypt = require("bcryptjs");
const Otp = require("../../model/otp/otp");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

const transpoter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user: "darshanchovatiya30@gmail.com",
    pass: "ezgv skmf szna bjzt",
  },
});

exports.sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new ErrorHandler("Enter Email", StatusCodes.BAD_REQUEST));
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return next(new ErrorHandler("User Nou Found", StatusCodes.NOT_FOUND));
    }

    const otp = Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit random number
     
    const otpsend = await Otp.create({
      otp: otp,
      email: email,
      userId: user._id,
    });

    await transpoter.sendMail({
      from: "darshanchovatiya30@gmail.com",
      to: otpsend.email,
      subject: "Forget Password",
      html: `
        <img src="https://firebasestorage.googleapis.com/v0/b/blogs-7dbc9.appspot.com/o/comapny%20Image%2Fmainlogo.png?alt=media&token=0b99d0cd-cf5a-4502-a4d7-d8353b86f975" width="300px" height="200px"/>
        <h1>Forget Password Otp: ${otpsend.otp}</h1>
      `,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Otp Sent Succeesfuly",
      data: otpsend,
    });

  } catch (error) {
    return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.postOtpCheck = async (req, res, next) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return next(new ErrorHandler("Enter OTP", StatusCodes.BAD_REQUEST));
    }

    const checkotp = await Otp.findOne({ otp: otp });
    if (!checkotp) {
      return next(new ErrorHandler("Invelide OTP", StatusCodes.NOT_FOUND));
    }

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Otp enter Succeesfuly",
      data: checkotp,
    });
  } catch (error) {
    return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.putResetPass = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const { password, Confirm_Password } = req.body;

    if (!password || !Confirm_Password) {
      return next(
        new ErrorHandler("All Fields are required", StatusCodes.BAD_REQUEST)
      );
    }

    if (password !== Confirm_Password) {
      return next(
        new ErrorHandler("Both Passwords are not the same", StatusCodes.BAD_REQUEST)
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User ID not found", StatusCodes.NOT_FOUND));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    const updatedUser = await user.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Password updated successfully",
      data: updatedUser
    });

  } catch (error) {
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};


exports.deleteotp = async (req,res,next) =>{
  try {
    const { userId } = req.params;
    if (!userId) {
      return next(new ErrorHandler("userId not found", StatusCodes.NOT_FOUND));
    }

    const otp = await Otp.findOne({userId:userId});
    if (!otp) {
      return next(new ErrorHandler("otp not found", StatusCodes.NOT_FOUND));
    }

    const otpdelete = await Otp.findByIdAndDelete(otp._id);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "OTP Delete success",
      data: otpdelete,
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        error.message || "INTERNAL_SERVER_ERROR",
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
}
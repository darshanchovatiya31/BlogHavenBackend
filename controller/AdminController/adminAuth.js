const Admin = require('../../model/Admin/Admin')
const bcrypt = require("bcryptjs");
const { ErrorHandler } = require('../../middleware/errorHandler')
const { StatusCodes } = require('http-status-codes')
const jwt = require('jsonwebtoken')


exports.postAdminSignUp = async (req, res, next) => {
  try {
    console.log(req.body)
    const { password, Confirm_Password, email } = req.body; 

      if (!password || !Confirm_Password || !email) {
        return next(new ErrorHandler("All Fileds are requried", StatusCodes.BAD_REQUEST));
      }
    
      if (password != Confirm_Password) {
        return next(
          new ErrorHandler("Both Passwors Not Same", StatusCodes.BAD_REQUEST)
        );
      }
     
    const hasspasword = await bcrypt.hash(password, 10);

      const result = await Admin.create({
        email:email,
        password: hasspasword,
      });

      return res.status(StatusCodes.CREATED).json({
        success: true,
        message: "ADMIN SIGNUP SUCSSEFULYY",
        data: result
      });
    } catch (error) {
        return next(new ErrorHandler(error,StatusCodes.INTERNAL_SERVER_ERROR))
    }
}

exports.postAdminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
       return next(new ErrorHandler("All Fileds are requried", StatusCodes.BAD_REQUEST));
    }

    const admin = await Admin.findOne({ email: email });
    if (!admin) {
      return next(new ErrorHandler("Admin not found", StatusCodes.NOT_FOUND));
    }

    const passcomm = await bcrypt.compare(password, admin.password);
    if (!passcomm) {
       return next(new ErrorHandler("password not match", StatusCodes.NOT_FOUND));
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
      },
      process.env.JWT_SECRET_KEY,
      {expiresIn:'3h'});

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Admin LOGIN SUCSSEFULYY",
      data: admin,
      Token: token
    });

  } catch (error) {
    return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};



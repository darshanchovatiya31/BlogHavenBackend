const jwt = require("jsonwebtoken");
const { ErrorHandler } = require("./errorHandler");
const { StatusCodes } = require("http-status-codes");
const User = require("../model/User/User");
const Admin = require("../model/Admin/Admin");

exports.authntication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(new ErrorHandler("Not token Found", StatusCodes.NOT_FOUND));
    }

    const TOKEN = authHeader.split(" ")[1];
   

    const checkToken = jwt.verify(TOKEN, process.env.JWT_SECRET_KEY);
  

    const user = await User.findById({ _id: checkToken.userId });
   
    if (!user) {
      return next(new ErrorHandler("Not Found User", StatusCodes.NOT_FOUND));
    }

    req.id = checkToken.userId;
    req.email = checkToken.email;
    next();
  } catch (error) {
    return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.AdminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next(new ErrorHandler("Not token Found", StatusCodes.NOT_FOUND));
    }

    const TOKEN = authHeader.split(" ")[1];
   

    const checkToken = jwt.verify(TOKEN, process.env.JWT_SECRET_KEY);
  

    const admin = await Admin.findById({ _id: checkToken.adminId });
   
    if (!admin) {
      return next(new ErrorHandler("Not Found Admin", StatusCodes.NOT_FOUND));
    }

    req.adminid = checkToken.adminId;
    req.adminemail = checkToken.email;
    next();
  } catch (error) {
    return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};



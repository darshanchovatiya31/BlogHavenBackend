const User = require('../../model/User/User')
const bcrypt = require("bcryptjs");
const { ErrorHandler } = require('../../middleware/errorHandler')
const { StatusCodes } = require('http-status-codes')
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken')
const FilestorageFirabse = require('../../middleware/multerFileStorgae')

//node mailer
const transpoter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user: "darshanchovatiya30@gmail.com",
    pass: "pkjp umhx orti vuok",
  },
});

exports.postUserSignUp = async (req, res, next) => {
  try {
    const { fname, username, password, Confirm_Password, email } = req.body; 
    const profile = req.file

      if (!fname || !username || !password || !Confirm_Password || !email) {
        return next(
          new ErrorHandler("All Fileds are requried", StatusCodes.BAD_REQUEST)
        );
      }
    
    if (!profile) {
       return next(new ErrorHandler("select File", StatusCodes.BAD_REQUEST));
     }
    
      if (password != Confirm_Password) {
        return next(
          new ErrorHandler("Both Passwors Not Same", StatusCodes.BAD_REQUEST)
        );
      }

      const user = await User.findOne({ email: email });
      if (user) {
        return next(
          new ErrorHandler("Email Already exist", StatusCodes.UNAUTHORIZED)
        );
      }

      //node mailer
      await transpoter.sendMail({
        from: "darshanchovatiya30@gmail.com",
        to: email,
        subject: "blog signup",
        text: "welcome to signup",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
                <h1 style="color: #4CAF50;">Welcome, ${fname}!</h1>
                <p>We’re excited to have you join <strong>BlogHaven</strong>, a vibrant space for creativity and self-expression.</p>
                
                <h2 style="color: #4CAF50;">Your account has been successfully created!</h2>
                <p>Your profile is currently under review by our team. This process may take up to 24 hours, and you’ll receive an email notification once your profile is approved.</p>
        
                <h3 style="color: #4CAF50;">What’s next?</h3>
                <p>While you wait, here are a few key guidelines to help you get started:</p>
                
                <ul style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; list-style: none; color: #333;">
                    <li style="margin-bottom: 10px;">
                        <strong>🔹 Original Content:</strong> Ensure that all your posts are original or properly credited. Plagiarism may lead to content removal and possible account suspension.
                    </li>
                    <li style="margin-bottom: 10px;">
                        <strong>🔹 No Misinformation:</strong> Always share accurate and verified information. Misleading content can result in penalties.
                    </li>
                    <li style="margin-bottom: 10px;">
                        <strong>🔹 Respect User Privacy:</strong> Do not share personal details without consent. Privacy violations may lead to restrictions.
                    </li>
                    <li style="margin-bottom: 10px;">
                        <strong>🔹 No Explicit Content:</strong> Posting adult or inappropriate content without proper labels or warnings is prohibited. Violators may face account suspension.
                    </li>
                </ul>
        
                <p>Thank you for joining BlogHaven! We look forward to seeing your creativity thrive.</p>
        
                <h3 style="color: #4CAF50;">Best regards,</h3>
                <p>The BlogHaven Team</p>
            </div>
        `,
      });
    const hasspasword = await bcrypt.hash(password, 10);
    
    const profile_picture = await FilestorageFirabse.uploadToFierbase(profile,null, 'user','profile');

      const result = await User.create({
        fname,
        username,
        profile: profile_picture,
        password: hasspasword,
        email,
      });

      return res.status(StatusCodes.CREATED).json({
        success: true,
        message: "USER SIGNUP SUCSSEFULYY",
        data: result,
      });
    } catch (error) {
        return next(new ErrorHandler(error,StatusCodes.INTERNAL_SERVER_ERROR))
    }
}

exports.postUserLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
       return next(new ErrorHandler("All Fileds are requried", StatusCodes.BAD_REQUEST));
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return next(new ErrorHandler("not user found", StatusCodes.NOT_FOUND));
    }

    const passcomm = await bcrypt.compare(password, user.password);
    if (!passcomm) {
       return next(
         new ErrorHandler("password not match", StatusCodes.NOT_FOUND)
       );
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET_KEY,
      {expiresIn:'6h'});

    return res.status(201).json({
      success: true,
      message: "USER LOGIN SUCSSEFULYY",
      data: user,
      Token: token
    });
  } catch (error) {
    return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.getProfileData = async (req,res,next) =>{
  try {
    const uId = req.id;
    if (!uId) {
      return next(
        new ErrorHandler("Login First", StatusCodes.UNAUTHORIZED)
      );
    }

    const profile = await User.findById(uId);
    if (!profile) {
      return next(new ErrorHandler("Profile Not Found", StatusCodes.NOT_FOUND));
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "PROFILE FATCH SUCSSEFULYY",
      data: profile,
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

exports.putUpdateProfile = async (req,res,next) =>{
  try {
    const { fname, username,email} = req.body;
    const { userId } = req.params;
    const profile = req.file;
    const usertype = "user";
    const filetype = "profile";

    if (!userId) {
      return next(new ErrorHandler("blogId are requried", StatusCodes.BAD_REQUEST));
    }

    if (!fname || !username || !email ) {
      return next(new ErrorHandler("All Fileds are requried", StatusCodes.BAD_REQUEST));
    }

    const Profile = await User.findById(userId);
    if (!Profile) {
      return next(new ErrorHandler("blog not found", StatusCodes.NOT_FOUND));
    }
    const userWithEmail = await User.findOne({ email: email });
    if (userWithEmail && userWithEmail._id.toString() !== userId) {
        return next(new ErrorHandler("Email already registered with another account", StatusCodes.UNAUTHORIZED));
    }

    if (profile) {
      if (Profile.profile) {
        await FilestorageFirabse.deleteFileFromFirebase(Profile.profile);
      }

      const newprofileImage = await FilestorageFirabse.uploadToFierbase(profile,null,usertype,filetype)

      Profile.profile = newprofileImage;
    }

    Profile.fname = fname
    Profile.username = username
    Profile.email = email

    const updateprofile = await Profile.save()

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Update Profile Successfully",
      data: updateprofile
    });

  } catch (error) {
     return next(new ErrorHandler(error.message,StatusCodes.INTERNAL_SERVER_ERROR));
  }
}












exports.getdata = async (req, res, next) => {
  try {
    const user = await User.find()
    if (!user) {
      return next(new ErrorHandler("not user found",StatusCodes.NOT_FOUND))
    }

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "USER FATCH SUCSSEFULYY",
      data: user,
      USERID: req.id,
      USEREMAIL:req.email
    });

  } catch (error) {
    return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
}
const { ErrorHandler } = require("../../middleware/errorHandler");
const { StatusCodes } = require("http-status-codes");
const User = require("../../model/User/User");
const nodemailer = require("nodemailer");

const transpoter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: "darshanchovatiya30@gmail.com",
      pass: "ezgv skmf szna bjzt",
    },
  });

exports.UserStatusChage = async(req,res,next) => {
    try {
        const {userId,status} = req.query

        if(!userId || !status){
            return next(new ErrorHandler("UserId and status requried",StatusCodes.BAD_REQUEST))
        }

        const user = await User.findById(userId)
        if(!user){
            return next(new ErrorHandler("User not found",StatusCodes.NOT_FOUND))
        }

        user.status = status
        const userStatus = await user.save()


        if(status === 'active'){
            await transpoter.sendMail({
                from: "darshanchovatiya30@gmail.com",
                to: userStatus.email,
                subject: "Account Approved",
                html: `
                  <div style="font-family: Arial, sans-serif; color: #333;">
                      <h1 style="color: #4CAF50;">Dear ${userStatus.username},</h1>
                      <p>We're excited to inform you that your account has been approved by our admin team!</p>
                      
                      <h2 style="color: #4CAF50;">You're all set to start creating blog posts!</h2>
                      <p>If you're already logged in, please log in again to enjoy full access to all features.</p>
            
                      <p>We can't wait to see the amazing content you'll share on <strong>BlogHaven</strong>!</p>
            
                      <h3 style="color: #4CAF50;">Best regards,</h3>
                      <p>The BlogHaven Team</p>
                  </div>
                `,
            });
        } else if(status === 'block'){
            await transpoter.sendMail({
                from: "darshanchovatiya30@gmail.com",
                to: userStatus.email,
                subject: "Account Blocked",
                html: `
                  <div style="font-family: Arial, sans-serif; color: #333;">
                      <h1 style="color: #FF0000;">Dear ${userStatus.username},</h1>
                      <p>We regret to inform you that your account has been blocked by the admin due to a violation of our community guidelines.</p>
                      
                      <h2 style="color: #FF0000;">Account Blocked</h2>
                      <p>Unfortunately, you will no longer be able to create blog posts or access certain features on <strong>BlogHaven</strong>.</p>
            
                      <h3>Reason for Block:</h3>
                      <p>It appears that some content you recently uploaded has been flagged as inappropriate. Our guidelines are in place to maintain a respectful and safe environment for all users, and the content you posted violates the following rule(s):</p>
            
                      <ul style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; list-style: none; color: #333;">
                          <li><strong>🔹 Respectful Communication:</strong> Ensuring that all users feel safe and respected.</li>
                          <li><strong>🔹 No Explicit Content:</strong> Avoid posting content that is explicit or inappropriate.</li>
                      </ul>
            
                      <p>If you believe this is a mistake, you may contact our support team for further clarification.</p>
            
                      <h3 style="color: #FF0000;">Best regards,</h3>
                      <p>The BlogHaven Team</p>
                  </div>
                `,
            });
        }

        


        return res.status(StatusCodes.OK).json({
            success: true,
            message: `User ${status} successfully`,
            data: userStatus,
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
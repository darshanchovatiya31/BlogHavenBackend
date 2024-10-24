const { postUserSignUp, postUserLogin, getdata, getProfileData, putUpdateProfile } = require('../controller/userController/userAuth') 
const { authntication } = require('../middleware/auth')
const {uploadMulter} = require('../middleware/multerFileStorgae')
const { sendOtp, postOtpCheck, putResetPass, deleteotp } = require('../controller/PassController/PassController')

 
const express = require("express");
const router = express.Router();

router.post("/user/user-signup", uploadMulter.single("profile"), postUserSignUp);

router.post("/user/user-login", postUserLogin)

router.get("/user/userdata", authntication, getdata);

router.post("/user/send-otp",sendOtp)

router.post("/user/reset-otp",postOtpCheck)

router.put("/user/update-password/:userId",putResetPass)

router.delete("/user/delete-otp/:userId",deleteotp)


router.get("/user/profiledata",authntication ,getProfileData)

router.put("/user/update-profile/:userId",authntication,uploadMulter.single("profile"),putUpdateProfile)


module.exports = router;

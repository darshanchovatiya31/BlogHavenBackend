const { ErrorHandler } = require("../../middleware/errorHandler");
const { StatusCodes } = require("http-status-codes");
const FilestorageFirebase = require("../../middleware/multerFileStorgae");
const Advertisement = require("../../model/Advartisement/Advartisement");
const User = require("../../model/User/User");

exports.postAd = async (req, res, next) => {
  try {
    const {
      title,
      ad_duration,
      contact,
      price,
      status,
      paymentClear,
      payment,
      paynow,
    } = req.body;

    const userType = "Advertisement";
    const filetype = "AdPoster";
    const userId = req.id;
    const poster = req.file;

    if (!poster) {
      return next(new ErrorHandler("Select Poster", StatusCodes.BAD_REQUEST));
    }

    if (!title || !ad_duration || !price) {
      return next(
        new ErrorHandler("All Filed Are Req", StatusCodes.BAD_REQUEST)
      );
    }

    const Ad_img = await FilestorageFirebase.uploadToFierbase(
      poster,
      userId,
      userType,
      filetype
    );

    const addata = await Advertisement.create({
      title,
      ad_duration,
      price,
      status,
      contact,
      paymentClear,
      paynow,
      payment,
      poster: Ad_img,
      userId: userId,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Ad added Successfully",
      data: addata,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

exports.getAd = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const uId = req.id;

    if (userId != uId) {
      return next(
        new ErrorHandler("UserId Not Match", StatusCodes.UNAUTHORIZED)
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(new ErrorHandler("User Not Found", StatusCodes.NOT_FOUND));
    }

    const Ads = await Advertisement.find({ userId: userId });

    if (!Ads) {
      return next(new ErrorHandler("No Ads Found", StatusCodes.NOT_FOUND));
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Ads Find Successfully",
      data: Ads,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

exports.getallads = async (req, res, next) => {
  try {
    const ads = await Advertisement.find().populate("userId");
    if (!ads) {
      return next(
        new ErrorHandler("Advertisement Not found", StatusCodes.NOT_FOUND)
      );
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Advertisement FATCH SUCSSEFULYY",
      data: ads,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

exports.putpaynow = async (req, res, next) => {
  try {
    const { adId} = req.params;

    if (!adId) {
      return next(
        new ErrorHandler("adId requried", StatusCodes.BAD_REQUEST)
      );
    }

    const advertisement = await Advertisement.findById(adId);
    if (!advertisement) {
      return next(new ErrorHandler("advertisement not found", StatusCodes.NOT_FOUND));
    }

    advertisement.paynow = 1;
    const advertisements = await advertisement.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: `advertisement successfully`,
      data: advertisements,
    });
  } catch (error) {
    return next( new ErrorHandler( error.message,StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.getactiveadds = async (req,res,next) =>{
    try {
        const status = "active";
        const adds = await Advertisement.find({status:status})
        if(!adds){
            return next(new ErrorHandler("advertisement not found", StatusCodes.NOT_FOUND));
        }
        
        return res.status(StatusCodes.OK).json({
            success: true,
            message: `status successfully`,
            data: adds,
          });
    } catch (error) {
        return next(new ErrorHandler(error.message,StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

exports.putstatusactive = async (req, res, next) => {
  try {
    const { adId} = req.params;

    if (!adId) {
      return next(
        new ErrorHandler("adId requried", StatusCodes.BAD_REQUEST)
      );
    }

    const advertisement = await Advertisement.findById(adId);
    if (!advertisement) {
      return next(new ErrorHandler("advertisement not found", StatusCodes.NOT_FOUND));
    }

    advertisement.status = "active";
    const advertisements = await advertisement.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: `advertisement successfully`,
      data: advertisements,
    });
  } catch (error) {
    return next( new ErrorHandler( error.message,StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.addstatusfilter = async (req,res,next) =>{
  try {
    const {userId} = req.params;
    if(!userId){
      return next(new ErrorHandler("userId not found", StatusCodes.BAD_REQUEST));
    }

    const add = await Advertisement.find({userId:userId})
    if(!add){
      return next(new ErrorHandler("Advertisement not found", StatusCodes.NOT_FOUND));
    }
    let pending = add.filter(ads => ads.status === "pending");
    let active = add.filter(ads => ads.status === "active");

    return res.status(StatusCodes.OK).json({
      success:true,
      message:"Advertisement status successfully",
      data:{
        pending:pending,
        active:active,
      }
    })
  } catch (error) {
    return next(new ErrorHandler(error.message,StatusCodes.INTERNAL_SERVER_ERROR));
  }
}

exports.invoice = async (req,res,next)=>{
  try {
    const {userId} = req.params;
    if(!userId){
      return next(new ErrorHandler("userId not Found",StatusCodes.BAD_REQUEST))
    }

    const Invoice = await Advertisement.find({userId:userId,paymentClear:true})
    if(!Invoice){
      return next(new ErrorHandler("Payment not cleared",StatusCodes.BAD_REQUEST))
    }

    return res.status(StatusCodes.OK).json({
      success:true,
      message:"Invoice successfully",
      data:Invoice,
    })
  } catch (error) {
    return next(new ErrorHandler(error.message,StatusCodes.INTERNAL_SERVER_ERROR))
  }
}

exports.invoicesingle = async (req,res,next) =>{
  try {
    const {adId} = req.params;
    
    if(!adId){
      return next(new ErrorHandler("userId not found",StatusCodes.BAD_REQUEST))
    } 

    const invoicedata = await Advertisement.findById(adId).populate("userId");
    if(!invoicedata){
      return next(new ErrorHandler("invoice data not found",StatusCodes.NOT_FOUND))
    }
    
    return res.status(StatusCodes.OK).json({
      success:true,
      message:"invoice data successfully",
      data:invoicedata,
    })
  } catch (error) {
    return next(new ErrorHandler(error.message,StatusCodes.INTERNAL_SERVER_ERROR))
  }
}
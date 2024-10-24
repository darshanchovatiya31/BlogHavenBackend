const { ErrorHandler } = require("../../middleware/errorHandler");
const { StatusCodes } = require("http-status-codes");
const User = require("../../model/User/User");
const Blog = require("../../model/Blogs/Blogs");
const Advertisement = require("../../model/Advartisement/Advartisement")
const FilestorageFirabse = require("../../middleware/multerFileStorgae")

exports.getDashboard = async (req, res, next) => {
  try {
    const TotalUser = await User.countDocuments();
    const TotalBlog = await Blog.countDocuments();
    const TotalAdvertisement = await Advertisement.countDocuments();
    const TotalEarning = await Advertisement.find({ paymentClear: true }, 'price');
    
        const Earning = TotalEarning.reduce((acc, ad) => parseInt(acc) + parseInt(ad.price), 0);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Dashboard fetch Successfully",
      data: {
        TotalUser: TotalUser,
        TotalBlog: TotalBlog,
        TotalAdvertisement:TotalAdvertisement,
        Earning:Earning,
      },
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

exports.getDashboardChat = async (req, res, next) => {
  try {
    const blogs = await Blog.find();

    if (!blogs || blogs.length === 0) {
      return next(new ErrorHandler("No blogs found", StatusCodes.NOT_FOUND));
    }

    const monthlyBlogCount = Array(12).fill(0);

    blogs.forEach((blog) => {
      const month = new Date(blog.createdAt).getMonth();

      monthlyBlogCount[month]++;
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Chart data fetched successfully",
      data: monthlyBlogCount,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

exports.getDashboardPaymentChat = async (req, res, next) => {
  try {
    const Ads = await Advertisement.find(); 

    if (!Ads || Ads.length === 0) {
      return next(new ErrorHandler("No advertisements with payment found", StatusCodes.NOT_FOUND));
    }

    const monthlyPaymentCount = Array(12).fill(0);

    Ads.forEach((ad) => {
      if (ad.paymentClear) {
          const month = new Date(ad.createdAt).getMonth();
          monthlyPaymentCount[month] += parseFloat(ad.price);
      }
  });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Chart data fetched successfully",
      data: monthlyPaymentCount,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

exports.getalluser = async (req, res, next) => {
  try {
    const user = await User.find()
    if (!user) {
      return next(new ErrorHandler("User Not found", StatusCodes.NOT_FOUND));
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "USERS FATCH SUCSSEFULYY",
      data: user,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

exports.postDeleteuser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return next(new ErrorHandler("userId not found", StatusCodes.NOT_FOUND));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("user not found", StatusCodes.NOT_FOUND));
    }

    const { profile } = user;
    if (profile) {
      await FilestorageFirabse.deleteFileFromFirebase(profile)
    }

    const blogs = await Blog.find({ userId: userId });

        if (blogs.length > 0) {
            for (let blog of blogs) {
                if (blog.blogimg) {
                    await FilestorageFirabse.deleteFileFromFirebase(blog.blogimg);
                }

                if (Array.isArray(blog.additionalimg) && blog.additionalimg.length > 0) {
                    for (let img of blog.additionalimg) {
                        await FilestorageFirabse.deleteFileFromFirebase(img);
                    }
                }
            }
        }

    const deleteBlog = await Blog.deleteMany({ userId: userId });
    const userDelete = await User.findByIdAndDelete(userId);

            

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User Delete Successfully",
      data: {
        deleteBlog,
        userDelete
      }
    });
    
  } catch (error) {
    return next(new ErrorHandler(error.message ,StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.userSeraching = async (req, res, next) => {
  try {
    const { username } = req.query;
    if (!username) {
      return next(
        new ErrorHandler("username are requried", StatusCodes.BAD_REQUEST)
      );
    }

    const user = await User.find({ username: { $regex: username, $options: "i" } });
    if (!user) {
      return next(new ErrorHandler("Username not found", StatusCodes.NOT_FOUND));
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User find Successfully",
      data: user,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

exports.blogSeraching = async (req, res, next) => {
  try {
    const { title } = req.query;
    if (!title) {
      return next(
        new ErrorHandler("Title are requried", StatusCodes.BAD_REQUEST)
      );
    }

    const blogs = await Blog.find({ title: { $regex: title, $options: "i" } }).populate("userId");
    if (!blogs) {
      return next(new ErrorHandler("Blog not found", StatusCodes.NOT_FOUND));
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Blog find Successfully",
      data: blogs,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

exports.adminstatusfilter = async (req,res,next) =>{
  try {
    const users = await User.find()
    if(!users){
      return next(new ErrorHandler("Blog not found", StatusCodes.NOT_FOUND));
    }
    let pending = users.filter(user => user.status === "pending");
    let active = users.filter(user => user.status === "active");
    let block = users.filter(user => user.status === "block");

    return res.status(StatusCodes.OK).json({
      success:true,
      message:"user status successfully",
      data:{
        pending:pending,
        active:active,
        block:block
      }
    })

  } catch (error) {
    return next(new ErrorHandler(error.message,StatusCodes.INTERNAL_SERVER_ERROR));
  }
}

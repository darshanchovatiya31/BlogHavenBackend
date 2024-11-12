const Blog = require("../../model/Blogs/Blogs");
const { ErrorHandler } = require("../../middleware/errorHandler");
const { StatusCodes } = require("http-status-codes");
const FilestorageFirabse = require("../../middleware/multerFileStorgae");
const User = require("../../model/User/User");

exports.postdata = async (req, res, next) => {
  try {
    const {name,title,category,maindescription,adddescription1,adddescription2} = req.body;
    const { userId } = req.params;
    const blogimg = req.files.blogimg ? req.files.blogimg[0] : null;
    const additionalimg = req.files.additionalimg || [];
    const usertype = "userPost";
    const filetype = "blogimages";

    if (req.id != userId) {
      return next(
        new ErrorHandler(
          "Unauthorized for create blogs",
          StatusCodes.UNAUTHORIZED
        )
      );
    }

    if (!blogimg || additionalimg.length === 0) {
      return next(new ErrorHandler("select files", StatusCodes.BAD_REQUEST));
    }

    if (!name || !title || !category ||
      !maindescription ||
      !adddescription1 ||
      !adddescription2
    ) {
      return next(
        new ErrorHandler("All Fileds are requried", StatusCodes.BAD_REQUEST)
      );
    }

    const blog_img = await FilestorageFirabse.uploadToFierbase(
      blogimg,
      userId,
      usertype,
      filetype
    );

    const additional_images = await Promise.all(
      additionalimg.map((image) =>
        FilestorageFirabse.uploadToFierbase(image, userId, usertype, filetype)
      )
    );

    const Blogdata = await Blog.create({
      name,
      title,
      category,
      maindescription,
      adddescription1,
      adddescription2,
      blogimg: blog_img,
      additionalimg: additional_images,
      userId: userId,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "BLOG ADDED SUCSSEFULYY",
      data: Blogdata,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

exports.getBlogsdata = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const uId = req.id;

    if (userId != uId) {
      return next(
        new ErrorHandler("User Id Not Match", StatusCodes.UNAUTHORIZED)
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User Not Match", StatusCodes.NOT_FOUND));
    }

    const blogs = await Blog.find({ userId: userId });
    if (!blogs) {
      return next(new ErrorHandler("Blog Not Match", StatusCodes.NOT_FOUND));
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "BLOG FATCH SUCSSEFULYY",
      data: blogs,
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        error.message || "INTERNAL_SERVER_ERROR",
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
};

exports.getHomeBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find().populate("userId").sort({ createdAt: -1 });
    
    if (!blogs) {
      return next(new ErrorHandler("Blog Not found", StatusCodes.NOT_FOUND));
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "BLOG FATCH SUCSSEFULYY",
      data: blogs,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

exports.postDelete = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    if (!blogId) {
      return next(new ErrorHandler("blogId not found", StatusCodes.NOT_FOUND));
    }

    const blogs = await Blog.findById(blogId);
    if (!blogs) {
      return next(new ErrorHandler("Blogs not found", StatusCodes.NOT_FOUND));
    }

    const { blogimg, additionalimg } = blogs;
    if (blogimg) {
      await FilestorageFirabse.deleteFileFromFirebase(blogimg);
    }

    if (additionalimg && Array.isArray(additionalimg)) {
      for (let img of additionalimg) {
        await FilestorageFirabse.deleteFileFromFirebase(img);
      }
    }

    const blogdelete = await Blog.findByIdAndDelete(blogId);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Blog Delete success",
      data: blogdelete,
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        error.message || "INTERNAL_SERVER_ERROR",
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
};

exports.getupdateblog = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    if (!blogId) {
      return next(new ErrorHandler("blogId not found", StatusCodes.NOT_FOUND));
    }
    const blogs = await Blog.findById(blogId);
    if (!blogs) {
      return next(new ErrorHandler("Blogs not found", StatusCodes.NOT_FOUND));
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Blog Data Fetch Success",
      data: blogs
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        error.message || "INTERNAL_SERVER_ERROR",
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
};

exports.UpdateBlog = async (req, res, next) => {
  try {
    const { name, title,category, maindescription,adddescription1,adddescription2} = req.body;
    const { blogId } = req.params;
    const blogimg = req.files.blogimg ? req.files.blogimg[0] : null;
    const additionalimg = req.files.additionalimg || [];
    const usertype = "userPost";
    const filetype = "blogimages";

    if (!blogId) {
      return next(new ErrorHandler("blogId are requried", StatusCodes.BAD_REQUEST));
    }

    if (!name || !title || !category || !maindescription || !adddescription1 || !adddescription2) {
      return next(new ErrorHandler("All Fileds are requried", StatusCodes.BAD_REQUEST));
    }

    const blogs = await Blog.findById(blogId);
    if (!blogs) {
      return next(new ErrorHandler("blog not found", StatusCodes.NOT_FOUND));
    }

    if (blogimg) {
      if (blogs.blogimg) {
        await FilestorageFirabse.deleteFileFromFirebase(blogs.blogimg);
      }

      const newBlogImage = await FilestorageFirabse.uploadToFierbase(blogimg,blogs.userId,usertype,filetype)

      blogs.blogimg = newBlogImage;
    }

    if (additionalimg.length > 0) {
      if (blogs.additionalimg && blogs.additionalimg.length > 0) {
        for (let images of blogs.additionalimg) {
          await FilestorageFirabse.deleteFileFromFirebase(images);
        }
      }

      const newAdditionlImages = await Promise.all(
        additionalimg.map(img => FilestorageFirabse.uploadToFierbase(img,blogs.userId,usertype,filetype))
      ) 

      blogs.additionalimg = newAdditionlImages
    }

    blogs.name = name
    blogs.title = title
    blogs.maindescription = maindescription
    blogs.adddescription1 = adddescription1
    blogs.adddescription2 = adddescription2
    blogs.category = category

    const updateblog = await blogs.save()

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Update Blog Successfully",
      data: updateblog
    });

  } catch (error) {
     return next(new ErrorHandler(error.message,StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.homePageCategory = async(req,res,next) => {
  try {

    const blogs = await Blog.find().sort({ createdAt: -1 });
    if (!blogs) {
      return next(new ErrorHandler("Blog not found", StatusCodes.NOT_FOUND));
    }

    let Business = blogs.filter(blog => blog.category === 'Business');
    let Education = blogs.filter(blog => blog.category === 'Education');
    let Food = blogs.filter(blog => blog.category === 'Food');
    let Arts = blogs.filter(blog => blog.category === 'Arts');
    let Fashion = blogs.filter(blog => blog.category === 'Fashion');
    let Entertainment = blogs.filter(blog => blog.category === 'Entertainment');


    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Update Blog Successfully",
      data: {
        Business:Business,
        Education:Education,
        Food:Food,
        Arts:Arts,
        Fashion:Fashion,
        Entertainment:Entertainment
      }
    });


  } catch (error) {
    return next(new ErrorHandler(error.message,StatusCodes.INTERNAL_SERVER_ERROR));
  }
}

exports.blogSerach = async(req,res,next) => {
  try {
    const {title,userId} = req.query
    if(!title|| !userId){
      return next(new ErrorHandler("Title are requried",StatusCodes.BAD_REQUEST))
    }

    
    const blogs = await Blog.find({userId: userId,title: { $regex: title, $options: "i" }});
    if(!blogs){
      return next(new ErrorHandler("Blog not found",StatusCodes.NOT_FOUND))
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Blog find Successfully",
      data: blogs
    });

  } catch (error) {
    return next(new ErrorHandler(error.message,StatusCodes.INTERNAL_SERVER_ERROR));
  }
}

exports.LikeandUnlike = async(req,res,next) => {
  try {
      const {blogId,userId} = req.params

      const blog = await Blog.findById(blogId)
      if(!blog){
          return next(new ErrorHandler("Blog not Found",StatusCodes.NOT_FOUND))
      }

      const hasLike = blog.like.includes(userId)

      if(hasLike){
         blog.like.pull(userId)
      } else {
         blog.like.push(userId)
      }

      const like = await blog.save()

      return res.status(StatusCodes.OK).json({
          success: true,
          message: "Blog Like Successfully",
          data: like
      });

  } catch (error) {
      return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
  }
} 

exports.LikeCount = async(req,res,next) => {
  try {
      const {blogId} = req.params

      const blog = await Blog.findById(blogId)
      if(!blog){
          return next(new ErrorHandler("Blog not Found",StatusCodes.NOT_FOUND))
      }

       const LikeCounts = blog.like.length
      

      return res.status(StatusCodes.OK).json({
          success: true,
          message: "Blog LikeCounts Successfully",
          data: LikeCounts
      });

  } catch (error) {
      return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
  }
}



const { postdata, getBlogsdata, getHomeBlogs, postDelete, getupdateblog,UpdateBlog,homePageCategory, blogSerach, LikeandUnlike, LikeCount } = require("../controller/BlogController/BlogController"); 
const {uploadMulter} = require('../middleware/multerFileStorgae')
const express = require("express");
const router = express.Router();
const { authntication } = require("../middleware/auth");


router.post("/blog/blog-data/:userId",authntication,uploadMulter.fields([{name:"blogimg",maxCount:1},{name:"additionalimg",maxCount:10}]),postdata)

router.get("/user/userpost/:userId", authntication, getBlogsdata);

router.get("/user/homeblogs", getHomeBlogs);

router.delete("/user/postdelete/:blogId", authntication, postDelete);

router.get("/user/view/blogs/post/:blogId", authntication, getupdateblog);

router.put("/blog/update/blogs/:blogId",authntication,uploadMulter.fields([{name:"blogimg",maxCount:1},{name:"additionalimg",maxCount:10}]),UpdateBlog)

router.get("/user/update/blogsdata/:blogId", authntication, getupdateblog);

router.get("/user/category/blog",homePageCategory)

router.get("/user/category/search",blogSerach)

router.post("/user/blog/like/unlike/:blogId/:userId",authntication,LikeandUnlike);

router.get("/user/blog/likeCounts/:blogId",LikeCount)

module.exports = router;

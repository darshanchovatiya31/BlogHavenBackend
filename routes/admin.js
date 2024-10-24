const express = require("express");
const router = express.Router();

const {getDashboard,getDashboardChat, blogSeraching, getalluser, postDeleteuser, userSeraching, adminstatusfilter, getDashboardPaymentChat} = require('../controller/AdminController/adminDashboard');
const {getHomeBlogs, postDelete, getupdateblog} = require('../controller/BlogController/BlogController')
const { UserStatusChage } = require("../controller/AdminController/UserMangemnet");
const { postAdminSignUp,postAdminLogin } = require("../controller/AdminController/adminAuth");
const {AdminAuth} = require('../middleware/auth');
const { getallads, putpaynow, putstatusactive } = require("../controller/AdController/Advertisement");


router.post('/admin/signup',postAdminSignUp)
router.post('/admin/login',postAdminLogin)

// dashboard
router.get('/admin/dashboard',AdminAuth,getDashboard)
router.get('/admin/chat/dashboard',AdminAuth,getDashboardChat)
router.get('/admin/chat/dashboard/payment',AdminAuth,getDashboardPaymentChat)


// user
router.get("/admin/alluser",AdminAuth,getalluser)
router.delete("/admin/userdelete/:userId",AdminAuth,postDeleteuser);
router.get("/admin/user/searching",userSeraching)

//User Mangemnet
router.put('/admin/user/status',AdminAuth,UserStatusChage)
// status filtering
router.get("/admin/status/filter",AdminAuth,adminstatusfilter)


// blogs
router.get('/admin/blog/allblog',AdminAuth,getHomeBlogs)
router.delete("/admin/postdelete/:blogId", AdminAuth, postDelete);
router.get("/admin/view/blogs/post/:blogId", AdminAuth, getupdateblog);
router.get("/admin/category/searching",blogSeraching)


//Advertisement
router.get("/admin/allads",AdminAuth,getallads)
router.put("/admin/paynow/:adId",AdminAuth,putpaynow)
router.put("/admin/status/active/:adId",AdminAuth,putstatusactive)


module.exports = router;

const express = require('express')
const { postAd, getAd, getactiveadds, addstatusfilter } = require('../controller/AdController/Advertisement');
const { uploadMulter } = require("../middleware/multerFileStorgae");
const { authntication } = require("../middleware/auth");
const { getpayment, postverfying } = require('../controller/Payment/Payment');
const router = express.Router()

router.post("/user/ad", authntication, uploadMulter.single("poster"), postAd);

router.get("/user/allad/:userId", authntication, getAd);

router.get("/user/payment/:adId", getpayment)

router.get("/user/payment/verfy/:order_id/:adId", postverfying)

router.get("/user/status/active",getactiveadds)

router.get("/user/addstatus/filter",authntication,addstatusfilter)

module.exports = router;
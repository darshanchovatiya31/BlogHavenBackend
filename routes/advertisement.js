const express = require('express')
const { postAd, getAd, getactiveadds, addstatusfilter, invoice, invoicesingle } = require('../controller/AdController/Advertisement');
const { uploadMulter } = require("../middleware/multerFileStorgae");
const { authntication } = require("../middleware/auth");
const { getpayment, postverfying } = require('../controller/Payment/Payment');
const router = express.Router()

router.post("/user/ad", authntication, uploadMulter.single("poster"), postAd);

router.get("/user/allad/:userId", authntication, getAd);

router.get("/user/payment/:adId", getpayment)

router.get("/user/payment/verfy/:order_id/:adId", postverfying)

router.get("/user/status/active",getactiveadds)

router.get("/user/addstatus/filter/:userId",authntication,addstatusfilter)

router.get("/user/invoice/:userId",authntication,invoice)

router.get("/user/invoicesingle/:adId",authntication,invoicesingle)

module.exports = router;
const crypto = require("crypto");
const { Cashfree } = require("cashfree-pg");
const { StatusCodes } = require("http-status-codes");
const { ErrorHandler } = require("../../middleware/errorHandler");
const Advertisement = require("../../model/Advartisement/Advartisement");
const moment = require('moment')

Cashfree.XClientId = process.env.CLIENT_ID;
Cashfree.XClientSecret = process.env.CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

function generateOrderId() {
  const uniqueId = crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHash("sha256");
  hash.update(uniqueId);
  return hash.digest("hex").substr(0, 12);
}

exports.getpayment = async (req, res, next) => {
  try {
    const { adId } = req.params;
    if (!adId) {
      return next(
        new ErrorHandler(
          "UserId and AdId are required",
          StatusCodes.BAD_REQUEST
        )
      );
    }

    const paymentInfo = await Advertisement.findById(adId).populate("userId");
    if (!paymentInfo) {
      return next(
        new ErrorHandler(
          "Advertisement not found or payment already cleared",
          StatusCodes.NOT_FOUND
        )
      );
    }

    let request = {
      order_amount: paymentInfo.price,
      order_currency: "INR",
      order_id: generateOrderId(),
      customer_details: {
        customer_id: paymentInfo.userId._id,
        customer_name: paymentInfo.userId.fname,
        customer_email: paymentInfo.userId.email,
        customer_phone: `${paymentInfo.contact}`,
      },
    };

    const response = await Cashfree.PGCreateOrder("2023-08-01", request);

    if (!response || !response.data) {
      return next(
        new ErrorHandler(
          "Failed to create payment",
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Payment created successfully",
      data: response.data,
    });
  } catch (error) {
    console.error(
      "Error during payment creation:",
      error.response?.data || error.message
    );
    return next(
      new ErrorHandler(
        error.response?.data?.message || error.message,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
};

exports.postverfying = async (req, res, next) => {
  try {
    const { order_id, adId } = req.params;
    if (!order_id || !adId) {
      return next(
        new ErrorHandler("Order id required", StatusCodes.BAD_REQUEST)
      );
    }

    const response = await Cashfree.PGFetchOrder("2023-08-01", order_id);
    if (!response) {
      return next(
        new ErrorHandler("Response not found", StatusCodes.NOT_FOUND)
      );
    }

    const ad = await Advertisement.findById(adId);
    if (!ad) {
      return next(
        new ErrorHandler("Advertisement not found", StatusCodes.BAD_REQUEST)
      );
    }

    if (response.data.order_status === "PAID") {
      ad.paymentClear = true;
      ad.paynow = 1;
    }

    const day = parseInt(ad.ad_duration);

    ad.lastTime = moment().add(day, 'days');
    ad.payment = response.data;
    await ad.save();

    console.log("Paymnenst SuccessFully Created");

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Payment verified successfully",
      data: response.data,
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        error.response?.data?.message || error.message,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
};

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpschema = new Schema({
  otp: {
    type: Number,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    default: "otp",
  }
});

const otp = mongoose.model("otpschema", otpschema);

module.exports = otp;

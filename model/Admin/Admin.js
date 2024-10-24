const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSChema = new Schema({
   email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role:{
    type: String,
    default: "Admin",
  }
});

const Admin = mongoose.model("Admin", adminSChema);

module.exports = Admin;

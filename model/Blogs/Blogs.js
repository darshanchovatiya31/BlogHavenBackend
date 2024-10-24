const { ref } = require("firebase/storage");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Blogs = new Schema({
  blogimg: {
    type: String,
    required: false,
  },
  additionalimg: {
    type: [String],
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  like:{
    type:[],
    required:false,
  },
  maindescription: {
    type: String,
    required: true,
  },
  adddescription1: {
    type: String,
    required: true,
  },
  adddescription2: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required:true
  },
  role: {
    type: String,
    default: "Blog",
  },
},{timestamps:true});

const blog = mongoose.model("Blog", Blogs);

module.exports = blog;

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
  },
  { timestamps: true }
);

// Index for faster queries
CategorySchema.index({ name: 1 });
CategorySchema.index({ isActive: 1 });

const Category = mongoose.model("Category", CategorySchema);

module.exports = Category;


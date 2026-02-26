const Category = require("../../model/Category/Category");
const { ErrorHandler } = require("../../middleware/errorHandler");
const { StatusCodes } = require("http-status-codes");

// Create Category
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
      return next(
        new ErrorHandler("Category name is required", StatusCodes.BAD_REQUEST)
      );
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      name: name.toUpperCase().trim(),
    });

    if (existingCategory) {
      return next(
        new ErrorHandler(
          "Category with this name already exists",
          StatusCodes.CONFLICT
        )
      );
    }

    const category = await Category.create({
      name: name.toUpperCase().trim(),
      description: description || "",
      createdBy: req.id || null,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get All Categories
exports.getAllCategories = async (req, res, next) => {
  try {
    const { activeOnly } = req.query;

    let query = {};
    if (activeOnly === "true") {
      query.isActive = true;
    }

    const categories = await Category.find(query)
      .sort({ name: 1 })
      .select("-__v");

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get Single Category
exports.getCategoryById = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);

    if (!category) {
      return next(
        new ErrorHandler("Category not found", StatusCodes.NOT_FOUND)
      );
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

// Update Category
exports.updateCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { name, description, isActive } = req.body;

    const category = await Category.findById(categoryId);

    if (!category) {
      return next(
        new ErrorHandler("Category not found", StatusCodes.NOT_FOUND)
      );
    }

    // Check if new name already exists (excluding current category)
    if (name && name.trim() !== "") {
      const existingCategory = await Category.findOne({
        name: name.toUpperCase().trim(),
        _id: { $ne: categoryId },
      });

      if (existingCategory) {
        return next(
          new ErrorHandler(
            "Category with this name already exists",
            StatusCodes.CONFLICT
          )
        );
      }

      category.name = name.toUpperCase().trim();
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (isActive !== undefined) {
      category.isActive = isActive;
    }

    await category.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

// Delete Category
exports.deleteCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);

    if (!category) {
      return next(
        new ErrorHandler("Category not found", StatusCodes.NOT_FOUND)
      );
    }

    // Check if category is being used in blogs
    const Blog = require("../../model/Blogs/Blogs");
    const blogsWithCategory = await Blog.findOne({ category: category.name });

    if (blogsWithCategory) {
      return next(
        new ErrorHandler(
          "Cannot delete category. It is being used in blogs. Please deactivate it instead.",
          StatusCodes.BAD_REQUEST
        )
      );
    }

    await Category.findByIdAndDelete(categoryId);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

// Toggle Category Status (Active/Inactive)
exports.toggleCategoryStatus = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);

    if (!category) {
      return next(
        new ErrorHandler("Category not found", StatusCodes.NOT_FOUND)
      );
    }

    category.isActive = !category.isActive;
    await category.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: `Category ${category.isActive ? "activated" : "deactivated"} successfully`,
      data: category,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};


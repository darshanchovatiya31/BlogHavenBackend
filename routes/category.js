const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} = require("../controller/CategoryController/CategoryController");
const { AdminAuth } = require("../middleware/auth");

// Public routes (for frontend to fetch categories)
router.get("/user/categories", getAllCategories);
router.get("/user/categories/:categoryId", getCategoryById);

// Admin routes (protected)
router.post("/admin/category/create", AdminAuth, createCategory);
router.get("/admin/categories", AdminAuth, getAllCategories);
router.get("/admin/category/:categoryId", AdminAuth, getCategoryById);
router.put("/admin/category/update/:categoryId", AdminAuth, updateCategory);
router.delete("/admin/category/delete/:categoryId", AdminAuth, deleteCategory);
router.put("/admin/category/toggle/:categoryId", AdminAuth, toggleCategoryStatus);

module.exports = router;


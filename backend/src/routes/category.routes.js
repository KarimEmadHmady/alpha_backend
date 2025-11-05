import express from "express";
import { addCategory, updateCategory, deleteCategory, getAllCategories } from "../controllers/category.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeAdmin } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", authenticate, authorizeAdmin, addCategory);
router.put("/:id", authenticate, authorizeAdmin, updateCategory);
router.delete("/:id", authenticate, authorizeAdmin, deleteCategory);
router.get("/", getAllCategories);

export default router;

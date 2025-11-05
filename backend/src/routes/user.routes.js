import express from "express";
import multer from "multer";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeAdmin, authorizeRole } from "../middlewares/role.middleware.js";
import { UserController } from "../controllers/user.controller.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.get("/", authenticate, authorizeAdmin, UserController.getAll);
router.post("/register",  authenticate,  authorizeAdmin,   UserController.register);  //
router.post("/login", UserController.login);
router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password", UserController.resetPassword);
router.post("/logout", authenticate, UserController.logout);
router.post("/logoutAll", authenticate, authorizeAdmin, UserController.logoutAll);
router.post("/me/avatar", authenticate, upload.single("avatar"), UserController.updateAvatar);
router.post("/bio", authenticate, UserController.updateBio);
router.put("/:id", authenticate, authorizeAdmin, UserController.updateUser);
router.put("/role/:id", authenticate, authorizeAdmin, UserController.changeUserRole);
router.delete("/:id", authenticate, authorizeAdmin, UserController.deleteUser);

export default router;

import express from "express";
import multer from "multer";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRole, authorizeAdmin } from "../middlewares/role.middleware.js";
import FundController from "../controllers/fund.controller.js";

const upload = multer({
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter(req, file, cb) {
    const allowedExtensions = /\.(jpg|jpeg|png|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i;

    if (!file.originalname.match(allowedExtensions)) {
      return cb(new Error("Please upload a valid file type"));
    }
    cb(undefined, true);
  },
});

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRole("admin", "manager"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "fund_manager_image", maxCount: 1 },
  ]),
  FundController.createFund
);

router.put("/reorder", authenticate, authorizeAdmin, FundController.reorderFunds);

router.put(
  "/:id",
  authenticate,
  authorizeRole("admin", "manager"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "fund_manager_image", maxCount: 1 },
  ]),
  FundController.updateFund
);

router.put("/:id/price", authenticate, authorizeRole("admin", "manager"), FundController.updateFundPrice);

router.put("/status/:id", authenticate, authorizeAdmin, FundController.updateFundStatus);

router.put("/status/decline/:id", authenticate, authorizeAdmin, FundController.declineFundStatus);

router.delete("/:id", authenticate, authorizeAdmin, FundController.deleteFund);

router.get("/me", authenticate, authorizeRole("admin", "manager"), FundController.getFundsForUser);

router.get("/", FundController.getAllFunds);

router.get("/all", FundController.getAllFundsNoPagination);

router.get("/status", FundController.getPendingFunds);

router.get("/approved", FundController.getApprovedFunds);

router.get("/:id", FundController.getFundDetails);

export default router;
import express from "express";
import {
  addProfileImage,
  login,
  removeProfileImage,
  signup,
  updateProfile,
  userInfo,
} from "../controllers/auth.controller.js"; // Ensure this path is correct
import AuthMiddlware from "../middleware/auth.middleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/profiles" });

router.post("/signup", signup);
router.post("/login", login);
router.get("/user-info", AuthMiddlware, userInfo);
router.post("/upadte-profile", AuthMiddlware, updateProfile);
router.post(
  "/add-profile-image",
  AuthMiddlware,
  upload.single("profile-image"),
  addProfileImage
);
router.delete("/remove-profile-image", AuthMiddlware, removeProfileImage);

export default router;

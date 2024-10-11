import { Router } from "express";
import {
  getMessages,
  uploadFile,
} from "../controllers/messages.controller.js";
import AuthMiddleware from "../middleware/auth.middleware.js";
import multer from "multer";

const router = Router();

const upload = multer({ dest: "uploads/files" });
router.post("/get-messages", AuthMiddleware, getMessages);
router.post("/upload-file", AuthMiddleware, upload.single("file"), uploadFile);

export default router;

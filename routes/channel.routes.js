import { Router } from "express";
import {
  createChannel,
  getMessageChannel,
  getUserChannel,
} from "../controllers/channel.conroller.js";
import AuthMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post("/create-channel", AuthMiddleware, createChannel);
router.get("/get-user-channels", AuthMiddleware, getUserChannel);
router.get(
  "/get-channel-messages/:channelId",
  AuthMiddleware,
  getMessageChannel
);

export default router;

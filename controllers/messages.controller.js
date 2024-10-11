import Message from "../models/messages.modal.js";
import { mkdirSync, renameSync } from "fs";

export const getMessages = async (req, res) => {
  const user1 = req.user.userId;
  const user2 = req.body.id;

  try {
    if (!user1 || !user2) {
      return res.status(400).json({ error: "Both user ID's required." });
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    })
      .sort({ timesstamp: 1 })
      .populate("answer");

    res.json({ messages, message: "Success" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File is required." });
    }

    const date = Date.now();
    let fileDir = `uploads/files/${date}`;
    let fileName = `${fileDir}/${req.file.originalname}`;

    mkdirSync(fileDir, { recursive: true });

    renameSync(req.file.path, fileName);

    res.json({ filePath: fileName });
  } catch (error) {
    res.status(400).json({ error });
  }
};

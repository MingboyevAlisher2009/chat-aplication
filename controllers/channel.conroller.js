import { Types } from "mongoose";
import Channel from "../models/channel.model.js";
import User from "../models/user.model.js";

export const createChannel = async (req, res) => {
  try {
    const { name, members } = req.body;
    const userId = req.user.userId;

    const admin = await User.findById(userId);

    if (!admin) res.status(400).json({ error: "Admin user not found" });

    const validMembers = await User.find({ _id: { $in: members } });

    if (validMembers.length !== members.length) {
      return res
        .status(400)
        .json({ error: "Some members are not valid users." });
    }

    const newChannel = new Channel({
      name,
      members,
      admin: userId,
    });

    await newChannel.save();
    res.status(201).json({ channel: newChannel });
  } catch (error) {
    res.status(500).json("Internal server error");
  }
};

export const getUserChannel = async (req, res) => {
  try {
    const userId = new Types.ObjectId(req.user.userId);
    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    })
      .sort({ updatedAt: -1 })
      .populate("messages");

    res.status(201).json({ channels });
  } catch (error) {
    res.status(500).json("Internal server error");
  }
};

export const getMessageChannel = async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "firstName lastName email _id color image",
      },
    });

    if (!channel) {
      res.status(404).json({ error: "Channel not found!" });
    }

    const messages = channel.messages;

    res.json({ messages });
  } catch (error) {
    res.status(500).json("Internal server error");
  }
};

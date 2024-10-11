import mongoose from "mongoose";
import User from "../models/user.model.js";
import Message from "../models/messages.modal.js";

export const searchContacts = async (req, res) => {
  const { searchTerm } = req.body;
  try {
    if (!searchTerm) {
      return res.status(400).json({ error: "Serch term is required." });
    }

    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const regEx = new RegExp(sanitizedSearchTerm, "i");

    const contacts = await User.find({
      $and: [
        { _id: { $ne: req.user.userId } },
        {
          $or: [{ firstName: regEx }, { lastName: regEx }, { email: regEx }],
        },
      ],
    }).select("-password");

    res.json({ contacts, message: "Success" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const getContactsForDMList = async (req, res) => {
  try {
    let { userId } = req.user;
    userId = new mongoose.Types.ObjectId(userId);

    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender",
            },
          },
          lastMessageTime: { $first: "$createdAt" },
          lastMessageType: { $first: "$messageType" },
          lastMessageContent: {
            $first: {
              $cond: {
                if: { $eq: ["$messageType", "file"] },
                then: "$fileUrl",
                else: "$content",
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      {
        $unwind: "$contactInfo",
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          lastMessageType: 1,
          lastMessageContent: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          image: "$contactInfo.image",
          color: "$contactInfo.color",
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    const contactsWithMessages = await Promise.all(
      contacts.map(async (contact) => {
        const messages = await Message.find({
          $or: [
            { sender: contact._id, recipient: userId },
            { sender: userId, recipient: contact._id },
          ],
        }).sort({ timestamp: -1 });

        return {
          ...contact,
          messages,
        };
      })
    );

    res.json({ contacts: contactsWithMessages, message: "Success" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.user.userId } },
      "firstName lastName _id email"
    );

    const contacts = users.map((item) => ({
      value: item._id,
      label: item.firstName ? `${item.firstName} ${item.lastName}` : item.email,
    }));

    res.json({ contacts, message: "Success" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

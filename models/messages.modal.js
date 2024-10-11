import { model, Schema } from "mongoose";

const MessageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: false,
  },
  messageType: {
    type: String,
    enum: ["text", "file"],
    required: true,
  },
  content: {
    type: String,
    required: function () {
      return this.messageType === "text";
    },
  },
  seen: {
    type: Boolean,
    default: false,
  },
  answer: {
    type: Schema.Types.ObjectId,
    ref: "Messages",
    required: false,
  },
  fileUrl: {
    type: String,
    required: function () {
      return this.messageType === "file";
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

MessageSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  this.createdAt = Date.now();
  next();
});

MessageSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Message = model("Messages", MessageSchema);

export default Message;

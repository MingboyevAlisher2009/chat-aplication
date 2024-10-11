import { model, Schema } from "mongoose";

const ChannelSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  members: [{ type: Schema.ObjectId, ref: "Users", required: true }],
  admin: { type: Schema.ObjectId, ref: "Users", required: true },
  messages: [{ type: Schema.ObjectId, ref: "Messages", required: true }],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

ChannelSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  this.createdAt = Date.now();
  next();
});

ChannelSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Channel = model("Channels", ChannelSchema);

export default Channel;

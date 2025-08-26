// models/Chat.js
import mongoose from "mongoose";
import messageSchema from "./Message.js";

const chatSchema = new mongoose.Schema({
  description: { type: String, default: "" },
  lastMessage: { type: String, default: "" },
  status: { type: Number, default: 2 },
  priority: { type: Number, default: 1 },
  timestamp: { type: String, default: () => new Date().toLocaleString() },
  messages: [messageSchema]
});

export default chatSchema;

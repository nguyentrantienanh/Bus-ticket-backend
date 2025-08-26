// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    id : { type: Number, required: true },
  sender: { type: String, required: true }, // "user" | "admin"
  text: { type: String, required: true },
  timestamp: { type: String,  required: true },
});

export default messageSchema;

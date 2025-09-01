import mongoose from "mongoose";
import chatSchema from "./Chat.js";
const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname:  { type: String, required: true },
  fullName: { type: String, default: "" },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  status:    { type: Number, default: 1 },
  type:      { type: Number, default: 1 },
  name:      { type: String },
  imageUrl:  { type: String, default: "" },
  phone:     { type: String, default: "" },     
  cccd:      { type: String, default: "" },     
  birthday:  { type: String, default: "" }, 
  country:   { type: String, default: "" },
  countryCode: { type: String, default: "" },
  address:   { type: String, default: "" },
  zipcode:   { type: String, default: "" },
  city:      { type: String, default: "" },     
  chats: [chatSchema], 
  ticket:    { type: Array, default: [] }
}, { timestamps: true });


export default mongoose.model("User", userSchema);
 
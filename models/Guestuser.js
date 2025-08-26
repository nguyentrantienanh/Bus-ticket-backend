import mongoose from "mongoose";

const GuestuserSchema = new mongoose.Schema({
  fullName: { type: String, default: "" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },  
  cccd: { type: String, default: "" },
  birthday: { type: String, default: "" },
  ticket: { type: Array, default: [] }
}, { timestamps: true });

export default mongoose.model("Guestuser", GuestuserSchema);

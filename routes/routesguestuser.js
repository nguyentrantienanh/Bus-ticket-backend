import express from "express";
import Guestuser from "../models/Guestuser.js";

const routesguestuser = express.Router();

// POST /api/guestusers
routesguestuser.post("/guestuserticket", async (req, res) => {
  try {
    const { fullName, phone, email, cccd, birthday, ticket } = req.body;

  
 
    const newGuest = new Guestuser({
        fullName, phone, email, cccd, birthday,
      ticket: ticket ? ticket : []
    });

    const savedGuest = await newGuest.save();
    res.status(201).json({
      message: "Tạo guest user thành công!",
      guest: savedGuest
    });
  } catch (err) {
    console.error("Lỗi server khi tạo guest:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// routesguestuser.ts
routesguestuser.put("/guestusersupdate/:id", async (req, res) => {
  try {
    const guestId = req.params.id;
    const { fullName, phone, email, cccd, birthday } = req.body;

    const guest = await Guestuser.findById(guestId);
    if (!guest) return res.status(404).json({ message: "Không tìm thấy guest user" });

    // Chỉ cập nhật thông tin cơ bản, giữ nguyên ticket
    guest.fullName = fullName ?? guest.fullName;
    guest.phone = phone ?? guest.phone;
    guest.email = email ?? guest.email;
    guest.cccd = cccd ?? guest.cccd;
    guest.birthday = birthday ?? guest.birthday;

    const savedGuest = await guest.save();
    res.status(200).json({ message: "Cập nhật guest user thành công", guest: savedGuest });
  } catch (err) {
    console.error("Lỗi server khi cập nhật guest:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});



// GET /api/guestusers
routesguestuser.get("/guestuserlist", async (req, res) => {
  try {
    const guestUsers = await Guestuser.find();
    res.status(200).json(guestUsers);
  } catch (err) {
    console.error("Lỗi lấy danh sách guest users:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});



export default routesguestuser;

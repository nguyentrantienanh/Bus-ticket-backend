import express from "express";
import User from "../models/User.js";
import Guestuser from "../models/Guestuser.js";
const bookticketsRoutes = express.Router();

// POST /api/booking/:userId
bookticketsRoutes.post("/:userId", async (req, res) => {
  const { userId } = req.params;
  const bookingDetails = req.body;

  if (!bookingDetails) {
    return res.status(400).json({ message: "Thiếu dữ liệu booking" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    if (!Array.isArray(user.ticket)) user.ticket = [];
    user.ticket.push(bookingDetails);

    await user.save();

    res.status(200).json({ message: "Đặt vé thành công", ticket: bookingDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// DELETE: xóa vé theo ticketId, áp dụng cho cả User & Guestuser
bookticketsRoutes.delete("/:ticketId", async (req, res) => {
  const { ticketId } = req.params;
  try {
    // Ép kiểu ticketId sang number nếu lưu dạng number
    const ticketIdNum = Number(ticketId);

    // Tìm trong User
    let user = await User.findOne({ "ticket.id": ticketIdNum }); 
 
    if (user) {
      user.ticket = user.ticket.filter(t => t.id !== ticketIdNum);
      await user.save();
      return res.status(200).json({ message: "Xóa vé thành công (User)" });
    }

    // Tìm trong Guestuser
    let guest = await Guestuser.findOne({ "ticket.id": ticketIdNum });
    if (guest) {
      guest.ticket = guest.ticket.filter(t => t.id !== ticketIdNum);
      await guest.save();
      return res.status(200).json({ message: "Xóa vé thành công (Guest)" });
    }

    // Nếu không tìm thấy ở cả hai
    res.status(404).json({ message: "Không tìm thấy vé" });
  } catch (err) {
    console.error("Lỗi server khi xóa vé:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});


// get vé theo id vé chỉ cần có id vé là thấy vé gồm của user và guest
bookticketsRoutes.get("/:ticketId", async (req, res) => {
  const { ticketId } = req.params;

  try {
    const users = await User.find({ "ticket.id": ticketId });
    if (users.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy vé" });
    }

    const user = users[0];
    const ticket = user.ticket.find(t => t.id === ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Không tìm thấy vé" });
    }

    res.status(200).json({ ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});



export default bookticketsRoutes;

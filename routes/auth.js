import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
 

const router = express.Router();

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    if (password.length < 10) {
      return res.status(400).json({ message: "Mật khẩu phải ít nhất 10 ký tự." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email đã tồn tại." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      name: `${firstname} ${lastname}`
    });

    await newUser.save();
    res.status(201).json({ message: "Tạo tài khoản thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// LOGIN
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email tồn tại
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu sai" });
    }
    //status 0 là tài khoản bị khóa
    if (user.status === 0) {
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        name: user.name,
        status: user.status,
        type: user.type,
        imageUrl: user.imageUrl
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// GOOGLE SIGNIN
router.post("/google-signin", async (req, res) => {
  try {
    const { email, firstname, lastname, googleId, imageUrl, name } = req.body;

    // Tìm user theo email
    let user = await User.findOne({ email });
    //status 0 là tài khoản bị khóa
    if (user && user.status === 0) {
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

    if (!user) {
      // Nếu chưa có thì tạo mới
      user = new User({
        firstname,
        lastname,
        email,
        password: googleId, // có thể hash googleId hoặc để chuỗi random
        name,
        imageUrl,
        status: 1,
        type: 1,
      });
      await user.save();
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Google login thành công",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        name: user.name,
        status: user.status,
        type: user.type,
        imageUrl: user.imageUrl,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});
// Lấy danh sách user
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});
 
// Cập nhật thông tin user theo id
// và thêm thông tin (const [formData, setFormData] = useState({
//   fullName: '',
//   phone: '',
//   email: '',
//   cccd: '',
//   birthday: `${currentYear}-01-01`
// })
   
 
router.put("/users/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json({ message: "Cập nhật user thành công", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});
// Xóa user theo id
router.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json({ message: "Xóa user thành công", user: deletedUser });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});
// lấy thông tin user theo id
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

 
// Tạo chat mới cho user
// router.post("/users/:id/chats", async (req, res) => {
//   try {
//     const { id } = req.params; // userId lấy từ URL
//     const { description, priority } = req.body;

//     const user = await User.findById(id);
//     if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

//     // Tạo chat mới
//     const newChat = new Chat({
//       userId: id,
//       description,
//       priority,
//       status: 2,
//       timestamp: new Date().toLocaleString(),
//       messages: []
//     });

//     await newChat.save();

//     // Gắn chat mới vào user.chats
//     user.chats.push(newChat._id);
//     await user.save();

//     res.json({ message: "Tạo chat thành công", chat: newChat });
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server", error: err.message });
//   }
// });
// Tạo chat mới cho user (lưu trực tiếp trong user.chats)
// Tạo chat mới cho user (lưu trực tiếp trong user.chats)
// POST /users/:userId/chats
router.post("/users/:userId/chats", async (req, res) => {
  try {
    const { userId } = req.params;
    const { description, priority } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    const newChat = {
      description,
      priority,
      status: 2,
      lastMessage: "",
      messages: [],
      timestamp: new Date().toLocaleString()
    };

    user.chats.push(newChat);
    await user.save();

    res.json({ message: "Tạo chat thành công", chat: user.chats[user.chats.length - 1] });
  } catch (err) {
    console.error("Lỗi tạo chat:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

//Get /users/:userId/chats 
router.get("/users/:userId/chats", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    res.json(user.chats);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});





// Lấy tất cả messages trong chat
router.get("/users/:id/chats/:chatId/messages", async (req, res) => {
  try {
    const { id, chatId } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    const chat = user.chats.id(chatId);
    if (!chat) return res.status(404).json({ message: "Không tìm thấy chat" });

    res.json(chat.messages);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// Gửi message vào chat
// POST /users/:userId/chats/:chatId/messages
router.post("/users/:userId/chats/:chatId/messages", async (req, res) => {
  try {
    const { userId, chatId } = req.params;
    const { sender, text } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    const chat = user.chats.id(chatId);
    if (!chat) return res.status(404).json({ message: "Không tìm thấy chat" });

    const newMessage = {
      id: sender === "user" ? 1 : 2,
      sender,
      text,
      timestamp: new Date().toLocaleString()
    };

    chat.messages.push(newMessage);
    chat.lastMessage = text;

    await user.save();

    res.json({ message: "Gửi message thành công", chat });
  } catch (err) {
    console.error("Lỗi gửi message:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

 // POST /api/admin/chats/:chatId/messages
router.post("/admin/chats/:chatId/messages", async (req, res) => {
  try {
    const { chatId } = req.params;
    const { sender, text } = req.body;

    // Tìm user có chatId
    const user = await User.findOne({ "chats._id": chatId });
    if (!user) return res.status(404).json({ message: "Không tìm thấy chat" });

    const chat = user.chats.id(chatId);
    const newMessage = {
      id: sender === "user" ? 1 : 2,
      sender,
      text,
      timestamp: new Date().toLocaleString()
    };
    chat.messages.push(newMessage);
    chat.lastMessage = text;
    chat.status = 1;  
    await user.save();

    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});






export default router;

// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun } = require("docx");
// fetch ni CommonJSda ishlatish usuli
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const ngrok = require('@ngrok/ngrok');
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const app = express();
const setupSwagger = require('./swagger');
const multer = require("multer");

// Middleware
app.use(express.json());
app.use(fileUpload());
setupSwagger(app);


app.use(cors({
  origin: 'http://localhost:5173', // yoki frontend URL
  credentials: true
}));
// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://Muzaffar:Muz%40ff%40r2005@cluster0.bqezo.mongodb.net/testDB?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// MODELS
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  userType: { type: String, enum: ["admin", "user"], default: "user" },
  gender: { type: String, enum: ["male", "female"], required: true },
  profilePic: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// 🔄 TO‘G‘RI: nomlash mos bo‘lishi kerak
UserSchema.virtual("defaultProfilePic").get(function () {
  return this.gender === "female"
    ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_7GwK7luxfhfSbfwfCK2X46mtfxexzWOmZQ&s"
    : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgDNiM1Y0lpdHQquSMIDtksMUGhqTcimWr3w&s";
});

UserSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    if (!ret.profilePic) ret.profilePic = ret.defaultProfilePic;
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});
UserSchema.set("toObject", { virtuals: true });

// Export qilish


const FileSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  text: String,
  font: String,
  color: String,
  size: String,
  editedAt: { type: Date, default: Date.now },
});
const ChatSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  message: String,
  response: String,
  timestamp: { type: Date, default: Date.now },
});

const VerificationSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  code: String,
  createdAt: { type: Date, default: Date.now, expires: 300 }, // 5 daqiqada o'chadi
});
const Verification = mongoose.model("Verification", VerificationSchema);
const User = mongoose.model("User", UserSchema);
const File = mongoose.model("File", FileSchema);
const Chat = mongoose.model("Chat", ChatSchema);
// uploads papkasidagi fayllarni static qilib ko‘rsatish
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(morgan("dev"));
// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later",
});
app.use("/api/", apiLimiter);
// AUTH HELPERS
const generateToken = (user) =>
  jwt.sign({ id: user._id }, "secret", { expiresIn: "7d" });
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, "secret");
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = `profile-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (allowed.test(ext) && allowed.test(mime)) {
      return cb(null, true);
    }
    cb(new Error("Faqat PNG, JPEG yoki JPG fayllar yuklanadi!"));
  }
});
// 1. Authentication
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, userType, gender } = req.body;

  if (!["male", "female"].includes(gender)) {
    return res.status(400).json({ message: "Gender noto‘g‘ri" });
  }

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ message: "Bu email ro‘yxatdan o‘tgan" });

  const hashed = await bcrypt.hash(password, 10);

  // genderga qarab profilePic belgilash
  const profilePic =
    gender === "female"
      ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_7GwK7luxfhfSbfwfCK2X46mtfxexzWOmZQ&s" // qisqartirilgan
      : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgDNiM1Y0lpdHQquSMIDtksMUGhqTcimWr3w&s";

  const user = await User.create({
    name,
    email,
    password: hashed,
    userType,
    gender,
    profilePic, // avtomatik o‘rnatiladi
  });

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 xonali
  await Verification.create({ userId: user._id, code });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "muzaffarbekmustafayev@gmail.com",
      pass: "vugb neoc auta mnik",
    },
  });

  await transporter.sendMail({
    from: "muzaffarbekmustafayev@gmail.com",
    to: email,
    subject: "Email tasdiqlash kodi",
    text: `Sizning tasdiqlash kodingiz: ${code}`,
  });

  res.json({ message: "Emailga tasdiqlash kodi yuborildi", userId: user._id });
});


app.post("/api/auth/verify-email", async (req, res) => {
  const { userId, code } = req.body;

  const verification = await Verification.findOne({ userId, code });
  if (!verification)
    return res
      .status(400)
      .json({ message: "Kod noto‘g‘ri yoki muddati o‘tgan" });

  // Tasdiqlangan foydalanuvchi qaytariladi
  const user = await User.findById(userId);
  if (!user)
    return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

  await Verification.deleteMany({ userId }); // eski kodlarni tozalash
  res.json({ message: "Email tasdiqlandi", token: generateToken(user) });
});
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(400).json({ message: "Invalid credentials" });
  res.json({ token: generateToken(user) });
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  const { name, email, userType, profilePic, createdAt } = req.user;
  res.json({ name, email, userType, profilePic, createdAt });
});

// 2. User Profile
app.get("/api/user/profile", authMiddleware, (req, res) => res.json(req.user));


app.put("/api/user/profile", authMiddleware, upload.single("profilePic"), async (req, res) => {
  try {
    const user = req.user;

    // ❌ Ruxsat yo‘q: foydalanuvchi rasmni yangilay olmaydi
    if (req.file) {
      return res.status(403).json({ message: "Rasmni faqat ro‘yxatdan o‘tishda yuklab bo‘ladi" });
    }

    // Ism va parolni yangilash
    if (req.body.name) user.name = req.body.name;
    if (req.body.password) user.password = await bcrypt.hash(req.body.password, 10);

    await user.save();

    const { password, ...userData } = user.toObject();
    res.json(userData);
  } catch (err) {
    console.error("Profil yangilashda xatolik:", err.message);
    res.status(500).json({ message: "Profilni yangilashda xatolik yuz berdi." });
  }
});



// 3. Text Editor
app.post("/api/editor/save", authMiddleware, async (req, res) => {
  const {
    text,
    font,
    color,
    size,
    bold,
    italic,
    underline,
    align,
    lineHeight,
    highlight,
    paragraphSpacing,
    table,
    bullets,
    numbering,
    image,
    layout,
    header,
    footer,
    passwordProtect,
    readOnly,
    comments,
    references,
    template,
    exportType,
  } = req.body;
  const file = await File.create({
    userId: req.user._id,
    text,
    font,
    color,
    size,
    bold,
    italic,
    underline,
    align,
    lineHeight,
    highlight,
    paragraphSpacing,
    table,
    bullets,
    numbering,
    image,
    layout,
    header,
    footer,
    passwordProtect,
    readOnly,
    comments,
    references,
    template,
    exportType,
    editedAt: new Date(),
  });
  res.json(file);
});

app.get("/api/editor/files", authMiddleware, async (req, res) => {
  const files = await File.find({ userId: req.user._id });
  res.json(files);
});

app.get("/api/editor/file/:id", authMiddleware, async (req, res) => {
  const file = await File.findOne({ _id: req.params.id, userId: req.user._id });
  if (!file) return res.status(404).json({ message: "Not found" });
  res.json(file);
});

app.put("/api/editor/file/:id", authMiddleware, async (req, res) => {
  const file = await File.findOne({ _id: req.params.id, userId: req.user._id });
  if (!file) return res.status(404).json({ message: "Not found" });
  const {
    text,
    font,
    color,
    size,
    bold,
    italic,
    underline,
    align,
    lineHeight,
    highlight,
    paragraphSpacing,
    table,
    bullets,
    numbering,
    image,
    layout,
    header,
    footer,
    passwordProtect,
    readOnly,
    comments,
    references,
    template,
    exportType,
  } = req.body;
  Object.assign(file, {
    text,
    font,
    color,
    size,
    bold,
    italic,
    underline,
    align,
    lineHeight,
    highlight,
    paragraphSpacing,
    table,
    bullets,
    numbering,
    image,
    layout,
    header,
    footer,
    passwordProtect,
    readOnly,
    comments,
    references,
    template,
    exportType,
    editedAt: new Date(),
  });
  await file.save();
  res.json(file);
});

// 4. Word Export & Email
app.get("/api/export/word/:fileId", authMiddleware, async (req, res) => {
  const file = await File.findOne({
    _id: req.params.fileId,
    userId: req.user._id,
  });
  if (!file) return res.status(404).json({ message: "Not found" });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ children: [new TextRun({ text: file.text })] }),
        ],
      },
    ],
  });
  const buffer = await Packer.toBuffer(doc);

  const filePath = path.join(__dirname, `temp_${file._id}.docx`);
  fs.writeFileSync(filePath, buffer);
  res.download(filePath, `text_${file._id}.docx`, () =>
    fs.unlinkSync(filePath)
  );
});
app.post("/api/export/email", authMiddleware, async (req, res) => {
  try {
    const { fileId, email } = req.body;
    const file = await File.findOne({ _id: fileId, userId: req.user._id });
    if (!file) return res.status(404).json({ message: "Not found" });

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({ children: [new TextRun({ text: file.text })] }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const filePath = path.join(__dirname, `email_${file._id}.docx`);
    fs.writeFileSync(filePath, buffer);

    console.log("Fayl tayyor:", filePath);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "muzaffarbekmustafayev@gmail.com",
        pass: "vugb neoc auta mnik", // Yangi app password bilan almashtiring
      },
    });

    const mailInfo = await transporter.sendMail({
      from: "muzaffarbekmustafayev@gmail.com",
      to: email,
      subject: "Sizga Word fayl yuborildi",
      text: "Quyida ilova qilingan Word faylni topasiz.",
      attachments: [{ filename: "document.docx", path: filePath }],
    });

    console.log("Emailga yuborildi:", mailInfo.response);

    fs.unlinkSync(filePath);

    res.json({ message: "Emailga yuborildi : " + email});

  } catch (err) {
    console.error("Email jo‘natishda xatolik:", err);
    res.status(500).json({ message: "Email jo‘natishda xatolik", error: err.message });
  }
});
// 5. File Delete
app.delete("/api/editor/file/:id", authMiddleware, async (req, res) => {
  try {
    const file = await File.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!file) {
      return res.status(404).json({ message: "Fayl topilmadi yoki sizga tegishli emas" });
    }

    res.json({ message: "Fayl muvaffaqiyatli o‘chirildi", file });
  } catch (err) {
    console.error("Faylni o‘chirishda xatolik:", err);
    res.status(500).json({ message: "Ichki server xatoligi", error: err.message });
  }
});


const GEMINI_API_KEY = "AIzaSyCud1tmnmMKS2nLhiC8shVkrHw2BfDgCbk"; // Your actual API key

app.post("/api/ai/chat", authMiddleware, async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ message: "Xabar bo‘sh bo‘lmasligi kerak" });
  }

  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: message }]
          }
        ]
      })
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      return res.status(500).json({ message: "Gemini javobi xato", detail: errorText });
    }

    const data = await geminiRes.json();
    const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "AI javob topilmadi";

    res.json({ response: aiReply });

  } catch (err) {
    res.status(500).json({
      message: "AI bilan bog‘lanishda xatolik yuz berdi",
      detail: err.message,
      errorType: err.name
    });
  }
});

app.get("/api/ai/history", authMiddleware, async (req, res) => {
  const history = await Chat.find({ userId: req.user._id });
  res.json(history);
});

// 6. Admin
app.get("/api/admin/users", authMiddleware, async (req, res) => {
  if (req.user.userType !== "admin")
    return res.status(403).json({ message: "Forbidden" });
  const users = await User.find();
  res.json(users);
});

app.delete("/api/admin/user/:id", authMiddleware, async (req, res) => {
  if (req.user.userType !== "admin")
    return res.status(403).json({ message: "Forbidden" });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});
app.post('/api/editor/save-send-email', authMiddleware, async (req, res) => {
    const { text, font, color, size, email } = req.body;
  
    // Faylni DBga yozish
    const file = await File.create({
      userId: req.user._id,
      text,
      font,
      color,
      size,
      editedAt: new Date()
    });
  
    // Word fayl yaratish
    const doc = new Document({
        sections: [{
          children: [new Paragraph({
            children: [new TextRun({
              text,
              font: font || "Arial",
              color: (color && color.startsWith("#") ? color.slice(1) : (
                color.length === 6 ? color : "000000" // fallback
              )),
              size: size ? parseInt(size) * 2 : 24
            })]
          })]
        }]
      });
      
      
    const buffer = await Packer.toBuffer(doc);
  
    const filePath = path.join(__dirname, `send_${file._id}.docx`);
    fs.writeFileSync(filePath, buffer);
  
    // Email yuborish
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'muzaffarbekmustafayev@gmail.com',
        pass: 'vugb neoc auta mnik'
      }
    });
  
    await transporter.sendMail({
      from: 'muzaffarbekmustafayev@gmail.com',
      to: email,
      subject: 'Yaratilgan faylingiz tayyor!',
      text: 'Fayl ilova qilingan holda yuborildi.',
      attachments: [{ filename: `text_${file._id}.docx`, path: filePath }]
    });
  
    // Faylni serverdan o‘chirib tashlash
    fs.unlinkSync(filePath);
  
    res.json({ message: 'Fayl yaratildi va emailga yuborildi', fileId: file._id });
  });
  
// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

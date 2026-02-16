const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

const app = express();
const PUBLIC_DIR = __dirname;

// ================= STATIC FILES =================
app.use(express.static(PUBLIC_DIR));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ================= DATABASE =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

// ================= CLOUDINARY CONFIG =================
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// ================= FILE UPLOAD (Cloudinary) =================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "resumes",
    resource_type: "raw"
  }
});

const upload = multer({ storage });

// ================= SCHEMA =================
const formSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  message: String,
  resume: String,
  type: String,
  createdAt: { type: Date, default: Date.now }
});

const Form = mongoose.model("Form", formSchema);

// ================= CLEAN URL ROUTING =================
app.get("/:page", (req, res, next) => {
  const page = req.params.page;

  const fileMap = {
    home: "home.html",
    "about-us": "about-us-1.html",
    "our-vision": "our-vision-1.html",
    "our-values": "about-us-1.html",
    contact: "contact.html",
    careers: "careers.html"
  };

  const fileName = fileMap[page] || `${page}.html`;

  const filePath = path.join(PUBLIC_DIR, fileName);

  res.sendFile(filePath, (err) => {
    if (err) next();
  });
});

// ================= CONTACT =================
app.post("/api/contact", async (req, res) => {
  try {
    await Form.create({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      message: req.body.message,
      type: "contact"
    });

    res.send("<script>alert('Contact Submitted'); window.history.back();</script>");
  } catch (err) {
    res.status(500).send("Error submitting contact form");
  }
});

// ================= CAREER =================
app.post("/api/career", upload.single("resume"), async (req, res) => {
  try {

    await Form.create({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      message: req.body.message,
      resume: req.file ? req.file.secure_url : "",
      type: "career"
    });

    res.send("<script>alert('Application Submitted'); window.history.back();</script>");

  } catch (err) {
    res.status(500).send("Error submitting application");
  }
});

// ================= ROOT =================
app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));

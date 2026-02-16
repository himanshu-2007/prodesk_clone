const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const app = express();
require("dotenv").config();

const PUBLIC_DIR = __dirname;

// Static files serve karo
app.use(express.static(PUBLIC_DIR));

// Clean URL rewrite rules
app.get("/:page", (req, res) => {
  const page = req.params.page;

  // Mapping logic
  const fileMap = {
    home: "home.html",
    "about-us": "about-us-1.html",
    "our-vision": "our-vision-1.html",
    "our-values": "about-us-1.html",
    contact: "contact.html"
  };

  const fileName = fileMap[page] || `${page}.html`;

  res.sendFile(path.join(PUBLIC_DIR, fileName), (err) => {
    if (err) {
      res.status(404).send("Page not found");
    }
  });
});


// ================= MIDDLEWARE =================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve frontend (parent folder se)
// app.use(express.static(path.join(__dirname, "..")));

// ================= DATABASE =================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// mongoose.connect("mongodb://127.0.0.1:27017/websiteDB")
// .then(() => console.log("MongoDB Local Connected"))
// .catch(err => console.log(err));

// ================= FILE UPLOAD =================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
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
  } catch {
    res.status(500).send("Error");
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
      resume: req.file ? req.file.filename : "",
      type: "career"
    });

    res.send("<script>alert('Application Submitted'); window.history.back();</script>");

  } catch {
    res.status(500).send("Error");
  }
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));

// app.get("/", (req, res) => {
//   res.redirect("/prodesk.in/home.html");
// });


// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });

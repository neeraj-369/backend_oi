const express = require("express");
const router = express.Router();
const User = require("../model/User");
const Developer = require("../model/Developer");
const Admin = require("../model/Admin");

const registerUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }
    const newUser = new User({ email, username, password });
    await newUser.save();
    res.json({ success: true, message: "User registered successfully." });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};


const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (password !== user.password) {
      return res.status(401).json({ success: false, message: "Invalid password." });
    }
    res.json({ success: true, message: "Login successful." });
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};


const registerDeveloper = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const existingDeveloper = await Developer.findOne({ email });
    if (existingDeveloper) {
      return res.status(400).json({ success: false, message: "Developer already exists." });
    }
    const newDeveloper = new Developer({ email, username, password });
    await newDeveloper.save();
    res.json({ success: true, message: "Developer registered successfully." });
  } catch (error) {
    console.error("Error during developer registration:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};


const loginDeveloper = async (req, res) => {
  try {
    const { username, password } = req.body;
    const developer = await Developer.findOne({ username });
    if (!developer) {
      return res.status(404).json({ success: false, message: "Developer not found." });
    }
    if (password !== developer.password) {
      return res.status(401).json({ success: false, message: "Invalid password." });
    }
    res.json({ success: true, message: "Developer login successful." });
  } catch (error) {
    console.error("Error during developer login:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};


const registerAdmin = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "Admin already exists." });
    }
    const newAdmin = new Admin({ email, username, password });
    await newAdmin.save();
    res.json({ success: true, message: "Admin registered successfully." });
  } catch (error) {
    console.error("Error during admin registration:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};


const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }
    if (password !== admin.password) {
      return res.status(401).json({ success: false, message: "Invalid password." });
    }
    res.json({ success: true, message: "Admin login successful." });
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

router.post("/userregister", registerUser);
router.post("/userlogin", loginUser);
router.post("/developerregister", registerDeveloper);
router.post("/developerlogin", loginDeveloper);
router.post("/adminregister", registerAdmin);
router.post("/adminlogin", loginAdmin);
module.exports = router;

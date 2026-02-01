import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";


const router = express.Router();
router.post("/register", async (req, res) => {
  const { name, email, password, cnic, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: "User already exists" });

    const hashedPw = await bcrypt.hash(password, 10);


    const employeeId = "EMP" + Date.now();

    const user = await User.create({
      name,
      email,
      password: hashedPw,
      employeeId, 
      cnic,
      role
    });

    res.status(201).json({
      msg: "Registration successful. Awaiting admin approval.",
      user,
    });
  } catch (error) {
console.error("Registration error:", error); 
  res.status(500).json({ msg: error.message, stack: error.stack });  }
});

router.post("/login", async (req, res) => {
 const { email, password } = req.body;

 try {
   const user = await User.findOne({ email });
   if (!user) return res.status(400).json({ msg: "Invalid credentials" });

   const isMatch = await bcrypt.compare(password, user.password);
   if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

   if (user.status !== "approved") return res.status(403).json({ msg: "Account not approved yet" });

   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

   res.json({ token, user });
 } catch (error) {
   res.status(500).json({ msg: error.message });
 }
});

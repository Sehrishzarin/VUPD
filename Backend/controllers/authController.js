import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured. Please check your .env file.");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const register = async (req,res) => {
  try{
    const { name, cnic, email, password, preferredCenter, qualification, role, contact } = req.body;
    if(!name || !cnic || !email || !password || !role) return res.status(400).json({ msg: "Missing fields" });
    const exists = await User.findOne({ $or: [{email},{cnic}] });
    if(exists) return res.status(400).json({ msg: "User already exists" });

   
    const normalizedRole = role.toLowerCase();
    const user = new User({
      name, cnic, email, password, preferredCenter, qualification,
      role: normalizedRole, contact, isApproved: false
    });

   
    if(normalizedRole !== "admin") user.employeeId = `EMP${Date.now().toString().slice(-6)}`;

    await user.save();
    return res.status(201).json({ msg: "Registered. Await admin approval." });
  }catch(err){
    return res.status(500).json({ msg: err.message });
  }
};

export const login = async (req,res) => {
  try{
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ msg: "Invalid credentials" });
    const match = await user.matchPassword(password);
    if(!match) return res.status(400).json({ msg: "Invalid credentials" });
    if(user.role !== "admin" && !user.isApproved) return res.status(403).json({ msg: "Account not approved yet" });

    const token = generateToken(user._id);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved, employeeId: user.employeeId }
    });
  }catch(err){
    return res.status(500).json({ msg: err.message });
  }
};

// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req,res,next) => {
  try{
    const token = req.headers.authorization?.split(" ")[1];
    if(!token) return res.status(401).json({ msg: "Not authorized, no token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if(!user) return res.status(401).json({ msg: "User not found" });
    req.user = user;
    next();
  }catch(err){
    return res.status(401).json({ msg: "Token invalid" });
  }
};

export const verifyAdmin = (req,res,next) => {
  if(req.user?.role !== "admin") return res.status(403).json({ msg: "Admin only" });
  next();
};

// backend/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cnic: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  employeeId: { type: String }, // admin have this generated
  preferredCenter: [{ type: String }],
  qualification: { type: String },
  role: { type: String, enum: ["admin","superintendent","invigilator"], required: true },
  isApproved: { type: Boolean, default: false },
  unavailableDates: [{ type: Date }],
  contact: { type: String },
  avatar: { type: String }, // path to uploaded file
}, { timestamps: true });

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;

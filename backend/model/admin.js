import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: { type: String, default: "" },
  role: {
    type: String,
    enum: ["admin"],
    default: "admin",
  },
});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;

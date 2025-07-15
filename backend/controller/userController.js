// import Admin from '../model/admin'
import Admin from "../model/admin.js";
import Price from "../model/price.js";
import Staff from "../model/staff.js";
import checkin from "../model/checkin.js";
import monthlyPass from "../model/monthlyPass.js";

import bcrypt from "bcryptjs";
// import Price from '../model/price'
import jwt from "jsonwebtoken";
const SECRET_KEY = "your_secret_key";


const addDailyPrices = async (req, res) => {
  try {
    const { adminId, dailyPrices } = req.body;

    let priceDoc = await Price.findOne({ adminId });

    if (!priceDoc) {
      // Create new document with dailyPrices only
      priceDoc = new Price({
        adminId,
        dailyPrices,
      });
      await priceDoc.save();
      return res.status(201).json({ message: "Daily prices added", data: priceDoc });
    } else if (priceDoc.dailyPrices && Object.values(priceDoc.dailyPrices).some(val => val !== "0")) {
      return res.status(400).json({ message: "Daily prices already exist" });
    } else {
      priceDoc.dailyPrices = dailyPrices;
      await priceDoc.save();
      return res.status(200).json({ message: "Daily prices set", data: priceDoc });
    }
  } catch (err) {
    console.error("Add Daily Prices Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

 const addMonthlyPrices = async (req, res) => {
  try {
    const { adminId, monthlyPrices } = req.body;

    let priceDoc = await Price.findOne({ adminId });

    if (!priceDoc) {
      // Create new document with monthlyPrices only
      priceDoc = new Price({
        adminId,
        monthlyPrices,
      });
      await priceDoc.save();
      return res.status(201).json({ message: "Monthly prices added", data: priceDoc });
    } else if (priceDoc.monthlyPrices && Object.values(priceDoc.monthlyPrices).some(val => val !== "0")) {
      return res.status(400).json({ message: "Monthly prices already exist" });
    } else {
      priceDoc.monthlyPrices = monthlyPrices;
      await priceDoc.save();
      return res.status(200).json({ message: "Monthly prices set", data: priceDoc });
    }
  } catch (err) {
    console.error("Add Monthly Prices Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateDailyPrices = async (req, res) => {
  try {
    const { adminId, dailyPrices } = req.body;

    const priceDoc = await Price.findOne({ adminId });

    if (!priceDoc) {
      return res.status(404).json({ message: "Price data not found for this admin" });
    }

    priceDoc.dailyPrices = dailyPrices;
    await priceDoc.save();

    return res.status(200).json({ message: "Daily prices updated", data: priceDoc });
  } catch (error) {
    console.error("Update Daily Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateMonthlyPrices = async (req, res) => {
  try {
    const { adminId, monthlyPrices } = req.body;

    const priceDoc = await Price.findOne({ adminId });

    if (!priceDoc) {
      return res.status(404).json({ message: "Price data not found for this admin" });
    }

    priceDoc.monthlyPrices = monthlyPrices;
    await priceDoc.save();

    return res.status(200).json({ message: "Monthly prices updated", data: priceDoc });
  } catch (error) {
    console.error("Update Monthly Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getPrices = async (req, res) => {
  try {
    const { adminId } = req.params;

    const priceDoc = await Price.findOne({ adminId });

    if (!priceDoc) {
      return res.status(404).json({ message: "No price data found for this admin" });
    }

    return res.status(200).json(priceDoc);
  } catch (error) {
    console.error("Get Prices Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


const registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const profileImage = req.file ? req.file.path : null; // Optional image

    // Check required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for existing admin
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }],
    });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin with optional image
    const newAdmin = new Admin({
      username,
      email,
      password: hashedPassword,
      profileImage, // Will be null if not provided
    });

    await newAdmin.save();

    // JWT token
    const token = jwt.sign(
      { id: newAdmin._id, username: newAdmin.username, role: newAdmin.role },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    // Response
    res.status(201).json({
      message: "Admin registered successfully",
      token,
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
        profileImage: newAdmin.profileImage, // could be null
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    let user = await Admin.findOne({ username });
    let role = "admin";

    if (!user) {
      user = await Staff.findOne({ username });
      role = "staff";
    }

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid username or password (user not found)" });
    }

    // ✅ Compare with correct hashed field
    const hashed = role === "admin" ? user.password : user.hashedPassword;

    const isPasswordValid = await bcrypt.compare(password, hashed);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid username or password (wrong password)" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        role,
        email: user.email || null,
        profileImage: user.profileImage || null,
        // Permissions: user.Permissions || []
        permissions: user.permissions, // ✅ Must be added
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const viewProfile = async (req, res) => {
  try {
    const { _id, role } = req.user;
    let user = null;

    if (role === "admin") {
      user = await Admin.findById(_id).select("-password");
    } else if (role === "staff") {
      user = await Staff.findById(_id).select("-password");
    }
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Profile fetched successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}, "-password"); // exclude password
    res.status(200).json(admins);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admins", error: error.message });
  }
};

// Get single admin by ID
const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id, "-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json(admin);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admin", error: error.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const updateData = { username };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedAdmin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    res.status(200).json({
      success: true,
      message: "Admin updated",
      admin: updatedAdmin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating admin",
      error: error.message,
    });
  }
};

// Delete admin
const deleteAdmin = async (req, res) => {
  try {
    const deleted = await Admin.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json({ message: "Admin deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting admin", error: error.message });
  }
};

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const admin = await Admin.findById(userId);
    if (!admin) {
      return res
        .status(404)
        .json({ message: "Admin not found or staff not allowed" });
    }

    const { date } = req.query; // Expect date in YYYY-MM-DD format
    const startOfDay = date ? new Date(date) : new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch staff
    const staffs = await Staff.find({ adminId: userId });

    // Fetch monthly passes created by admin or their staff
    const staffIds = staffs.map((staff) => staff._id);
    const monthlyPasses = await monthlyPass.find({
      createdBy: { $in: [userId, ...staffIds] },
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // Fetch check-ins and check-outs
    const checkIns = await Checkin.find({
      adminId: userId,
      entryDateTime: { $gte: startOfDay, $lte: endOfDay },
    });

    const checkOuts = await Checkout.find({
      adminId: userId,
      exitDateTime: { $gte: startOfDay, $lte: endOfDay },
    });

    // Calculate income for the selected date
    const todayIncome =
      checkIns.reduce((sum, checkin) => sum + (checkin.amount || 0), 0) +
      monthlyPasses.reduce((sum, pass) => sum + (pass.amount || 0), 0);

    // Calculate yesterday's income
    const yesterdayStart = new Date(startOfDay);
    yesterdayStart.setDate(startOfDay.getDate() - 1);
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setHours(23, 59, 59, 999);
    const yesterdayCheckIns = await Checkin.find({
      adminId: userId,
      entryDateTime: { $gte: yesterdayStart, $lte: yesterdayEnd },
    });
    const yesterdayMonthlyPasses = await MonthlyPass.find({
      createdBy: { $in: [userId, ...staffIds] },
      createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
    });
    const yesterdayIncome =
      yesterdayCheckIns.reduce(
        (sum, checkin) => sum + (checkin.amount || 0),
        0
      ) +
      yesterdayMonthlyPasses.reduce((sum, pass) => sum + (pass.amount || 0), 0);

    // Calculate monthly income (for the month of the selected date)
    const startOfMonth = new Date(
      startOfDay.getFullYear(),
      startOfDay.getMonth(),
      1
    );
    const endOfMonth = new Date(
      startOfDay.getFullYear(),
      startOfDay.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    const monthlyCheckIns = await Checkin.find({
      adminId: userId,
      entryDateTime: { $gte: startOfMonth, $lte: endOfMonth },
    });
    const monthlyPasss = await monthlyPass.find({
      createdBy: { $in: [userId, ...staffIds] },
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });
    const monthlyIncome =
      monthlyCheckIns.reduce((sum, checkin) => sum + (checkin.amount || 0), 0) +
      monthlyPasss.reduce((sum, pass) => sum + (pass.amount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        userId,
        staffs,
        monthlyPasses,
        checkIns,
        checkOuts,
        todayIncome,
        yesterdayIncome,
        monthlyIncome,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};

export default {
  // addPrice,
  // updatePrice,
  // getPrice,

   addDailyPrices,
  addMonthlyPrices,
  updateDailyPrices,
  updateMonthlyPrices,
  getPrices,
  registerAdmin,
  loginUser,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  viewProfile,
  getDashboardData,
};

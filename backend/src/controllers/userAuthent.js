const validate = require("../utils/validate.js");
const User = require("../Models/user");
const Problem = require("../Models/problem.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { redisClient } = require("../config/redis.js");
const Submission = require("../Models/submissions.js");

const register = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    // 1. Validate fields
    validate(req.body);
    const { firstName, emailId, password } = req.body;

    const normalizedEmail = emailId ? emailId.toLowerCase().trim() : "";
    console.log("Email being checked:", normalizedEmail);

    // 2. Check if user already exists
    const existingUser = await User.findOne({ emailId: normalizedEmail });
    console.log("Existing user found:", existingUser);

    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    // 3. Password Hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save to database
    const user = await User.create({
      firstName: firstName ? firstName.trim() : "",
      emailId: normalizedEmail,
      password: hashedPassword,
      role: "user",
    });

    // 5. Generate JWT Token
    if (!process.env.JWT_KEY) {
      throw new Error("JWT_KEY is not configured on the server");
    }

    const token = jwt.sign(
      { _id: user._id, email: user.emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    const result = {
      userId: user._id,
      firstName: user.firstName,
      emailId: user.emailId,
      role: user.role,
    };

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(201).json({
      data: result,
      message: "User registered successfully",
    });
  } catch (err) {
    console.error("Registration Error Details:", {
      message: err.message,
      code: err.code,
      keyPattern: err.keyPattern,
      keyValue: err.keyValue,
    });

    // Handle MongoDB duplicate key error fallback
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern || err.keyValue || {})[0] || "field";
      const duplicateValue = err.keyValue ? JSON.stringify(err.keyValue) : "";
      
      if (duplicateField === "emailId" || duplicateField === "email") {
        return res.status(400).json({ message: "An account with this email already exists." });
      }
      return res.status(400).json({
        message: `Database duplicate key conflict on '${duplicateField}': ${duplicateValue}. Please drop any stale indexes on MongoDB.`,
      });
    }
    return res.status(400).json({ message: err.message || "Registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!emailId) return res.status(400).json({ message: "Enter your email address" });
    if (!password) return res.status(400).json({ message: "Enter the password" });

    const user = await User.findOne({ emailId: emailId.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: "User not found" });

    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) return res.status(401).json({ message: "Invalid credentials" });

    if (!process.env.JWT_KEY) {
      throw new Error("JWT_KEY is not configured on the server");
    }

    const token = jwt.sign(
      { _id: user._id, email: user.emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    const result = {
      userId: user._id,
      firstName: user.firstName,
      emailId: user.emailId,
      role: user.role,
    };

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      data: result,
      message: "User Logged in Successfully",
    });
  } catch (err) {
    return res.status(401).json({ message: err.message || "Login failed" });
  }
};

const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (token) {
      const payload = jwt.decode(token);
      if (payload?.exp) {
        await redisClient.set(`token:${token}`, "blocked");
        await redisClient.expireAt(`token:${token}`, payload.exp);
      }
    }
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return res.status(200).json({ message: "Logout Successfully" });
  } catch (err) {
    return res.status(401).json({ message: err.message || "Logout error" });
  }
};

const adminRegister = async (req, res) => {
  try {
    validate(req.body);
    const { firstName, emailId, password } = req.body;

    const existingUser = await User.findOne({ emailId: emailId.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName: firstName.trim(),
      emailId: emailId.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
    });

    const token = jwt.sign(
      { _id: user._id, email: user.emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 1000,
    });
    return res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Admin registration failed" });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);
    return res.status(200).json({ message: "User Deleted Successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAuth = (req, res) => {
  const { _id, firstName, emailId, role } = req.user;
  const result = {
    userId: _id,
    firstName: firstName,
    emailId: emailId,
    role: role,
  };
  return res.status(200).json({
    data: result,
    message: "User Authenticated",
  });
};

const getProfile = async (req, res) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const submissions = await Submission.find({ userId: user._id })
      .select("problemId status runtime memory createdAt")
      .populate("problemId", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await Submission.countDocuments({ userId: user._id });
    const result = {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        age: user.age,
        role: user.role,
        totalProblemSolved: user.problemSolved.length,
      },
      submissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  adminRegister,
  deleteProfile,
  getAuth,
  getProfile,
};
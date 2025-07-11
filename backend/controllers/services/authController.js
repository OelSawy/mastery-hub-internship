import adminModel from "../../models/admin.js";
import userModel from "../../models/user.js";
import tokenBlacklistModel from "../../models/tokenBlacklist.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import SibApiV3Sdk from "sib-api-v3-sdk";
import mongoose from "mongoose";

dotenv.config();

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;
const transactionalEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const userCollections = {
  admin: adminModel,
  user: userModel,
};

const addAdmin = async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({
      message: "Please fill in all fields.",
    });
  }

  const UserModel = adminModel;

  try {
    const existingUser = await UserModel.findOne({
      email,
    });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }
    const user = new UserModel({
      username,
      email,
      password,
    });
    await user.save();
    res.json({
      message: "Admin added successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error adding admin.",
    });
  }
};

const register = async (req, res) => {
  const { firstName, lastName, email, password, mobile } = req.body;

  if (!firstName || !lastName || !email || !password || !mobile) {
    return res.status(400).json({
      message: "Please fill in all fields.",
    });
  }

  const UserModel = userModel;

  try {
    const existingUser = await UserModel.findOne({
      email,
    });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }
    const user = new UserModel({
      firstName,
      lastName,
      email,
      password,
      mobile,
    });
    await user.save();
    const sender = {
      name: "Marketplace Hub",
      email: "nnnh7240@gmail.com",
    };

    const recipients = [
      {
        email: user.email,
      },
    ];

    const emailContent = {
      sender,
      to: recipients,
      templateId: 10, // Replace with your Brevo template ID
      params: {
        firstName: user.firstName,
        browseLink: "www.google.com",
        currentYear: 2025
      },
    };

    const response = await transactionalEmailApi.sendTransacEmail(emailContent);
    if (response) {
      res.json({
        message: "User created successfully.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating user.",
    });
  }
};

const login = async (req, res) => {
  const { email, password, type } = req.body;

  // Validate request body
  if (!email || !password || !type || !userCollections[type]) {
    return res.status(400).send("Please fill in all fields.");
  }

  const UserModel = userCollections[type];

  try {
    // Find user in the database
    const user = await UserModel.findOne({
      email,
    });
    if (!user) return res.status(404).send("User not found");

    // Verify password
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) return res.status(401).send("Invalid password");

    // Generate access token (2-hour expiry)
    const token = jwt.sign(
      {
        email: user.email,
        type,
        _id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    // Generate refresh token (7-day expiry)
    const refreshToken = jwt.sign(
      {
        email: user.email,
        type,
        _id: user._id,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Set tokens as cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      sameSite: "lax", // For cross-origin cookies
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax", // For cross-origin cookies
    });

    res.status(200).json({
      message: "Login successful",
      user: user,
    });
  } catch (err) {
    res.status(500).send("Server error", { error: err });
  }
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(403).send("Refresh token is required");
  }

  try {
    // Verify refresh token and decode it
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Issue a new access token using the decoded info
    const newToken = jwt.sign(
      {
        email: decoded.email,
        type: decoded.type,
        _id: decoded._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      } // Access token expires in 2 hours
    );

    // Set the new access token in cookies
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.status(200).send({
      message: "Token refreshed successfully",
    });
  } catch (err) {
    res.status(401).send("Invalid or expired refresh token", { error: err });
  }
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).send("Refresh token is required");
  }

  try {
    // Add the refresh token to the blacklist
    await tokenBlacklistModel.create({
      token: refreshToken,
    });

    // Clear cookies
    res.clearCookie("token");
    res.clearCookie("refreshToken");

    // Respond with success
    res.status(200).send({
      message: "Logged out successfully",
    });
  } catch (err) {
    res.status(500).send("Server error", { error: err });
  }
};

const requestOtp = async (req, res) => {
  const { username, type } = req.body;

  // Validate type
  const userModel = userCollections[type];
  if (!userModel) return res.status(400).send("Invalid user type");

  try {
    // Check if the user exists
    const user = await userModel.findOne({
      username: username,
    });
    if (!user) return res.status(404).send("User not found");

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Save OTP and expiration in the database
    user.resetToken = otp;
    user.resetTokenExpiration = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    const sender = {
      name: "Triptomania",
      email: "triptomania.app@gmail.com",
    };

    const recipients = [
      {
        email: user.email,
      },
    ];

    const emailContent = {
      sender,
      to: recipients,
      templateId: 1, // Replace with your Brevo template ID
      params: {
        otp: otp,
      }, // Replace 'otp' with the template variable name
    };

    const response = await transactionalEmailApi.sendTransacEmail(emailContent);
    if (response.status === 200) {
      res.status(200).send("Email sent successfully");
    }
  } catch (err) {
    res.status(500).send("Server error", { error: err });
  }
};

const verifyOTP = async (req, res) => {
  const { otp, type, username } = req.body;
  const userModel = userCollections[type];
  if (!userModel) return res.status(400).send("Invalid user type");

  try {
    // Check if the user exists
    const user = await userModel.findOne({
      username: username,
    });
    if (!user) return res.status(404).send("User not found");

    // Check if the OTP is correct
    if (user.resetToken !== otp) return res.status(401).send("Invalid OTP");
    if (user.resetTokenExpiration < Date.now())
      return res.status(401).send("OTP has expired");
    // Reset the user's password
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).send("OTP verified successfully");
  } catch (err) {
    res.status(500).send("Server error", { error: err });
  }
};

async function hashPassword(password) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to hash password");
  }
}

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const type = req.user.type;
    const id = req.user._id;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid account ID format.",
      });
    }

    // Check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Check if newPassword meets minimum length
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    // Check if newPassword is different from oldPassword
    if (newPassword === oldPassword) {
      return res.status(400).json({
        message: "New password must be different from the old password",
      });
    }

    const userModel = userCollections[type];

    // Retrieve the account based on ID and type
    let account = await userModel.findById(id);

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    // Verify the old password
    const isMatch = await bcrypt.compare(oldPassword, account.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect old password",
      });
    }

    account.password = newPassword;
    await account.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const changeForgotPassword = async (req, res) => {
  try {
    const { newPassword, type, username } = req.body;

    // Check if newPassword meets minimum length
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const userModel = userCollections[type];

    // Retrieve the account based on ID and type
    let account = await userModel.findOne({
      username: username,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    const isMatch = await bcrypt.compare(newPassword, account.password);
    if (isMatch) {
      return res.status(400).json({
        message: "New password can not be the same as the old password",
      });
    }

    account.password = newPassword;
    await account.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json(
      {
        message: "Something went wrong",
      },
      { error: error }
    );
  }
};

export default {
  addAdmin,
  register,
  login,
  refreshToken,
  logout,
  requestOtp,
  verifyOTP,
  changePassword,
  changeForgotPassword,
};

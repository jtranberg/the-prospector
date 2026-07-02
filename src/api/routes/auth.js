/* eslint-disable no-undef */
import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import User from "../models/User.js";
import { createAuthToken } from "../lib/authTokens.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

function getSafeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    workspaceName: user.workspaceName,
    email: user.email,
    role: user.role,
  };
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, workspaceName } = req.body;

    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanName = String(name || "").trim();
    const cleanWorkspaceName = String(workspaceName || "").trim();

    if (!cleanEmail || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters",
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(409).json({
        error: "An account already exists for that email",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      workspaceName:
        cleanWorkspaceName || `${cleanName || "Scout"}'s Prospector`,
      email: cleanEmail,
      passwordHash,
      role: "SCOUT",
    });

    const token = createAuthToken(user);

    return res.status(201).json({
      user: getSafeUser(user),
      token,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      error: "Registration failed",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: cleanEmail }).select(
      "+passwordHash",
    );

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = createAuthToken(user);

    return res.json({
      user: getSafeUser(user),
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      error: "Login failed",
    });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({
    user: req.user,
  });
});

router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    if (String(newPassword).length < 8) {
      return res.status(400).json({
        error: "New password must be at least 8 characters",
      });
    }

    const user = await User.findById(req.user.id).select("+passwordHash");

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Current password is incorrect",
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordChangedAt = new Date();

    await user.save();

    return res.json({
      ok: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      error: "Could not change password",
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const user = await User.findOne({ email: cleanEmail });

    if (!user || !user.isActive) {
      return res.json({
        ok: true,
        message:
          "If an account exists for that email, password reset instructions have been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashResetToken(resetToken);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);

    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    console.log("Password reset link:", resetUrl);

    return res.json({
      ok: true,
      message:
        "If an account exists for that email, password reset instructions have been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      error: "Could not process password reset request",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: "Reset token and new password are required",
      });
    }

    if (String(newPassword).length < 8) {
      return res.status(400).json({
        error: "New password must be at least 8 characters",
      });
    }

    const hashedToken = hashResetToken(token);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+passwordHash +resetPasswordToken +resetPasswordExpires");

    if (!user || !user.isActive) {
      return res.status(400).json({
        error: "Password reset link is invalid or has expired",
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordChangedAt = new Date();
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.json({
      ok: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      error: "Could not reset password",
    });
  }
});

router.delete("/delete-my-data", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    await User.findByIdAndDelete(userId);

    res.clearCookie("token");

    return res.json({
      ok: true,
      message: "Your private account data has been deleted.",
    });
  } catch (error) {
    console.error("Delete my data error:", error);

    return res.status(500).json({
      error: "Unable to delete account data right now.",
    });
  }
});

export default router;
/* eslint-disable no-undef */

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({
        error: "Authentication token missing",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from environment variables");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select(
      "_id name workspaceName email role isActive",
    );

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: "Invalid or inactive user",
      });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      workspaceName: user.workspaceName,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    return res.status(401).json({
      error: "Invalid or expired authentication token",
    });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Insufficient permissions",
      });
    }

    next();
  };
}
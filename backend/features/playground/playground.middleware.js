import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../../models/User.js";

/**
 * Sets req.user for playground routes.
 * Extracts user ID from JWT token (Authorization header) and verifies user exists in database.
 */
export const withPlaygroundUser = async (req, res, next) => {
  try {
    console.log("[Playground Middleware] Request received:", {
      path: req.path,
      method: req.method,
      hasAuthHeader: !!req.headers.authorization,
      timestamp: new Date().toISOString()
    });

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const errorDetails = {
        error: "Authentication required",
        message: "No JWT token provided. Please log in.",
        details: {
          hasAuthHeader: !!authHeader,
          solution: "Please log in to use the playground. The JWT token will be automatically sent with requests."
        }
      };
      console.error("[Playground Middleware] No token:", errorDetails);
      return res.status(401).json(errorDetails);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Invalid token format. Please log in again.",
      });
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
      console.log("[Playground Middleware] JWT decoded:", { userId: decoded.userId });
    } catch (jwtError) {
      console.error("[Playground Middleware] JWT verification failed:", jwtError.message);
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Authentication required",
          message: "Token expired. Please log in again.",
        });
      }
      return res.status(401).json({
        error: "Authentication required",
        message: "Invalid token. Please log in again.",
      });
    }

    // Get user from database
    const user = await User.findById(decoded.userId).select("_id");
    
    if (!user) {
      console.error("[Playground Middleware] User not found in DB:", decoded.userId);
      return res.status(401).json({
        error: "Authentication required",
        message: "User not found. Please log in again.",
        details: {
          userIdFromToken: decoded.userId
        }
      });
    }

    // Attach user ID to request
    req.user = { id: user._id.toString() };
    console.log("[Playground Middleware] User authenticated:", {
      userId: req.user.id,
      source: "JWT token -> Database"
    });
    next();
  } catch (error) {
    console.error("[Playground Middleware] Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to authenticate user",
    });
  }
};

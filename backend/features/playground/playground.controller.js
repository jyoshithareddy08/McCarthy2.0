import mongoose from "mongoose";
import { handleChat } from "./playground.service.js";
import Session from "../../models/Session.js";
import Message from "../../models/Message.js";
import Tool from "../../models/Tool.js";

export const createSession = async (req, res) => {
  try {
    console.log("[createSession] Creating session:", {
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });
    
    if (!req.user || !req.user.id) {
      console.error("[createSession] Missing user context:", { user: req.user });
      return res.status(401).json({
        error: "Authentication required",
        message: "User context is missing. Please ensure you are logged in.",
        details: {
          hasUser: !!req.user,
          hasUserId: !!(req.user?.id)
        }
      });
    }
    
    const session = await Session.create({
      userId: req.user.id,
      type: "playground",
      chatTitle: "New Playground Chat",
    });

    console.log("[createSession] Session created:", { sessionId: session._id });
    res.json(session);
  } catch (err) {
    console.error("[createSession] Error:", err);
    res.status(500).json({
      error: "Failed to create session",
      message: err.message,
      details: {
        userId: req.user?.id,
        errorType: err.name
      }
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    console.log("[sendMessage] Request received:", {
      userId: req.user?.id,
      body: { sessionId: req.body.sessionId, prompt: req.body.prompt?.substring(0, 50), mode: req.body.mode, toolId: req.body.toolId },
      timestamp: new Date().toISOString()
    });
    
    if (!req.user || !req.user.id) {
      console.error("[sendMessage] Missing user context:", { user: req.user });
      return res.status(401).json({
        error: "Authentication required",
        message: "User context is missing. Please ensure you are logged in.",
        details: {
          hasUser: !!req.user,
          hasUserId: !!(req.user?.id)
        }
      });
    }
    
    const { sessionId, prompt, mode, toolId } = req.body;

    if (!sessionId || !prompt) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "sessionId and prompt are required",
        details: {
          hasSessionId: !!sessionId,
          hasPrompt: !!prompt
        }
      });
    }
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        error: "Invalid sessionId",
        message: `The provided sessionId "${sessionId}" is not a valid MongoDB ObjectId`,
        details: {
          providedSessionId: sessionId,
          format: "Expected: 24 character hex string"
        }
      });
    }
    const m = (mode || "automatic").toLowerCase();
    if (m !== "manual" && m !== "automatic") {
      return res.status(400).json({
        error: "Invalid mode",
        message: `Mode must be 'manual' or 'automatic', got: "${mode}"`,
        details: {
          providedMode: mode,
          validModes: ["manual", "automatic"]
        }
      });
    }
    if (m === "manual" && !toolId) {
      return res.status(400).json({
        error: "toolId required",
        message: "toolId is required when mode is 'manual'",
        details: {
          mode: m,
          hasToolId: !!toolId
        }
      });
    }
    if (m === "manual" && !mongoose.Types.ObjectId.isValid(toolId)) {
      return res.status(400).json({
        error: "Invalid toolId",
        message: `The provided toolId "${toolId}" is not a valid MongoDB ObjectId`,
        details: {
          providedToolId: toolId,
          format: "Expected: 24 character hex string"
        }
      });
    }

    const result = await handleChat({
      sessionId,
      prompt: String(prompt).trim(),
      mode: m,
      toolId: m === "manual" ? toolId : undefined,
    });

    console.log("[sendMessage] Message processed successfully");
    res.json(result);
  } catch (err) {
    console.error("[sendMessage] Error:", err);
    res.status(500).json({
      error: "Failed to send message",
      message: err.message,
      details: {
        errorType: err.name,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
      }
    });
  }
};

export const getTools = async (req, res) => {
  try {
    const tools = await Tool.find({}).select("title description keywords").lean();
    res.json(tools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log("getHistory called with sessionId:", sessionId);
    
    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
      console.error("Invalid sessionId:", sessionId);
      return res.status(400).json({ error: "Invalid sessionId" });
    }

    const messages = await Message.find({ sessionId })
      .sort({ createdAt: 1 })
      .lean();

    console.log(`Found ${messages.length} messages for session ${sessionId}`);
    res.json(messages);
  } catch (err) {
    console.error("Error in getHistory:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getSessions = async (req, res) => {
  try {
    console.log("[getSessions] Request received:", {
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });
    
    if (!req.user || !req.user.id) {
      console.error("[getSessions] Missing user context:", { user: req.user });
      return res.status(401).json({
        error: "Authentication required",
        message: "User context is missing. Please ensure you are logged in.",
        details: {
          hasUser: !!req.user,
          hasUserId: !!(req.user?.id)
        }
      });
    }
    
    const sessions = await Session.find({ 
      userId: req.user.id,
      type: "playground"
    })
      .sort({ createdAt: -1 })
      .select("_id chatTitle createdAt")
      .lean();

    console.log("[getSessions] Found sessions:", { count: sessions.length, userId: req.user.id });
    res.json(sessions);
  } catch (err) {
    console.error("[getSessions] Error:", err);
    res.status(500).json({
      error: "Failed to fetch sessions",
      message: err.message,
      details: {
        userId: req.user?.id,
        errorType: err.name
      }
    });
  }
};
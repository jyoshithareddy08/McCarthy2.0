import mongoose from "mongoose";
import { handleChat } from "./playground.service.js";
import Session from "../../models/Session.js";
import Message from "../../models/Message.js";
import Tool from "../../models/Tool.js";

export const createSession = async (req, res) => {
  try {
    const session = await Session.create({
      userId: req.user.id,
      type: "playground",
      chatTitle: "New Playground Chat",
    });

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { sessionId, prompt, mode, toolId } = req.body;

    if (!sessionId || !prompt) {
      return res.status(400).json({ error: "sessionId and prompt are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: "Invalid sessionId" });
    }
    const m = (mode || "automatic").toLowerCase();
    if (m !== "manual" && m !== "automatic") {
      return res.status(400).json({ error: "mode must be 'manual' or 'automatic'" });
    }
    if (m === "manual" && !toolId) {
      return res.status(400).json({ error: "toolId is required in manual mode" });
    }
    if (m === "manual" && !mongoose.Types.ObjectId.isValid(toolId)) {
      return res.status(400).json({ error: "Invalid toolId" });
    }

    const result = await handleChat({
      sessionId,
      prompt: String(prompt).trim(),
      mode: m,
      toolId: m === "manual" ? toolId : undefined,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const sessions = await Session.find({ 
      userId: req.user.id,
      type: "playground"
    })
      .sort({ createdAt: -1 })
      .select("_id chatTitle createdAt")
      .lean();

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
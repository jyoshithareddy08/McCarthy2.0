import express from "express";
import { sendMessage, createSession, getHistory, getTools, getSessions } from "./playground.controller.js";
import { withPlaygroundUser } from "./playground.middleware.js";

const router = express.Router();

router.get("/tools", getTools);

router.use(withPlaygroundUser);

router.get("/sessions", getSessions);
router.post("/session", createSession);
router.post("/chat", sendMessage);
router.get("/history/:sessionId", getHistory);

export default router;

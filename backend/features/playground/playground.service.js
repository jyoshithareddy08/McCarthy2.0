import { selectTool, selectToolBySimilarity } from "./toolSelector.js";
import { callLLM } from "./llmCaller.js";
import { getHistory, saveMessage } from "./memory.js";
import { buildPrompt } from "./utils.js";
import Session from "../../models/Session.js";

export const handleChat = async ({ sessionId, prompt, mode, toolId }) => {
  let tool;

  if (mode === "manual") {
    tool = await selectTool(null, toolId);
  } else {
    tool = await selectToolBySimilarity(prompt);
  }

  const history = await getHistory(sessionId);
  const finalPrompt = buildPrompt(history, prompt);

  // Update chat title if this is the first message
  const session = await Session.findById(sessionId);
  if (session && (!session.chatTitle || session.chatTitle === "New Playground Chat" || session.chatTitle === "New Chat")) {
    // Use first 50 characters of prompt as title
    const title = prompt.trim().slice(0, 50);
    if (title) {
      session.chatTitle = title + (prompt.length > 50 ? "..." : "");
      await session.save();
    }
  }

  let response;
  try {
    response = await callLLM(tool, finalPrompt);
    await saveMessage(sessionId, prompt, response);
  } catch (err) {
    response = `[API Error: ${err.message}]`;
  }

  return {
    response,
    modelUsed: tool.title,
  };
};

import { selectTool, selectToolBySimilarity } from "./toolSelector.js";
import { callLLM } from "./llmCaller.js";
import { getHistory, saveMessage } from "./memory.js";
import { buildPrompt } from "./utils.js";

export const handleChat = async ({ sessionId, prompt, mode, toolId }) => {
  let tool;

  if (mode === "manual") {
    tool = await selectTool(null, toolId);
  } else {
    tool = await selectToolBySimilarity(prompt);
  }

  const history = await getHistory(sessionId);
  const finalPrompt = buildPrompt(history, prompt);

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

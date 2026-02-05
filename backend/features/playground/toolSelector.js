import Tool from "../../models/Tool.js";
import { getBestToolForPrompt } from "./similarityService.js";

export const selectTool = async (task, manualToolId) => {
  if (manualToolId) {
    const tool = await Tool.findById(manualToolId).select("+apiKey");
    if (!tool) throw new Error("Tool not found");
    return tool;
  }

  const tools = await Tool.find({
    keywords: { $in: [task] },
  }).select("+apiKey");

  if (tools.length === 0) {
    const fallback = await Tool.findOne().select("+apiKey");
    if (!fallback) throw new Error("No tools configured. Add tools with keywords first.");
    return fallback;
  }

  return tools[0];
};

/**
 * Selects the best tool for a prompt using the Python similarity microservice.
 * Falls back to first tool if the service is unavailable.
 */
export const selectToolBySimilarity = async (prompt) => {
  const tools = await Tool.find({})
    .select("_id title description useCases keywords")
    .lean();

  if (tools.length === 0) {
    throw new Error("No tools configured. Add tools first.");
  }

  const result = await getBestToolForPrompt(prompt, tools);
  const toolId = result?.toolId;

  if (toolId) {
    const tool = await Tool.findById(toolId).select("+apiKey");
    if (tool) return tool;
    console.warn("[Similarity] Tool not found for id:", toolId, "- falling back");
  } else {
    console.warn("[Similarity] No result from service - falling back to first tool");
  }

  const fallback = await Tool.findOne().select("+apiKey");
  if (!fallback) throw new Error("No tools configured.");
  return fallback;
};

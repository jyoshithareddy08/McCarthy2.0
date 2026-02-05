/**
 * Resolves API endpoint for a tool/LLM.
 * Tool schema does not have apiEndpoint, so we use config/env lookup by tool title.
 * Set PLAYGROUND_LLM_ENDPOINT for default, or TOOL_ENDPOINT_<TITLE> for per-model (e.g. TOOL_ENDPOINT_GPT_4O).
 */
export const getEndpoint = (tool) => {
  if (!tool || !tool.title) return null;
  const key = tool.title.toUpperCase().replace(/\s+/g, "_").replace(/-/g, "_");
  return process.env[`TOOL_ENDPOINT_${key}`] || process.env.PLAYGROUND_LLM_ENDPOINT || null;
};

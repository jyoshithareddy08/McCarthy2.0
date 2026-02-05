import axios from "axios";
import { getEndpoint } from "../../config/toolEndpoints.js";

export const callLLM = async (tool, prompt) => {
  const endpoint = getEndpoint(tool) || tool.apiEndpoint;
  if (!endpoint) {
    throw new Error(`No API endpoint configured for tool "${tool?.title}". Set PLAYGROUND_LLM_ENDPOINT or TOOL_ENDPOINT_* in env.`);
  }

  const response = await axios.post(
    endpoint,
    { prompt },
    {
      headers: {
        Authorization: `Bearer ${tool.apiKey}`
      }
    }
  );

  return response.data.output || response.data;
};

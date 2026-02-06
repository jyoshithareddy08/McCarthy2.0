import axios from "axios";
import { getEndpoint } from "../../config/toolEndpoints.js";

/**
 * Replace placeholders in template with actual values
 */
function replacePlaceholders(template, values) {
  if (typeof template === 'string') {
    let result = template;
    for (const [key, value] of Object.entries(values)) {
      const placeholder = `{{${key}}}`;
      if (result.includes(placeholder)) {
        result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value || ''));
      }
    }
    return result;
  } else if (Array.isArray(template)) {
    return template.map(item => replacePlaceholders(item, values));
  } else if (template && typeof template === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(template)) {
      result[key] = replacePlaceholders(value, values);
    }
    return result;
  }
  return template;
}

/**
 * Get nested value from object using dot notation path
 */
function getNestedValue(obj, path) {
  const keys = path.split(/[\.\[\]]/).filter(k => k);
  let value = obj;
  for (const key of keys) {
    if (value == null) return null;
    value = value[key];
  }
  return value;
}

export const callLLM = async (tool, prompt) => {
  // Prefer DB-configured endpoint. Env-based endpoint is only a fallback for legacy setups.
  const endpoint = tool.apiEndpoint || getEndpoint(tool);
  if (!endpoint) {
    throw new Error(`No API endpoint configured for tool "${tool?.title}". Set PLAYGROUND_LLM_ENDPOINT or TOOL_ENDPOINT_* in env.`);
  }

  if (!tool.apiKey) {
    throw new Error(`API key not found for tool: ${tool.title}`);
  }

  // Get the model to use - first from tool.models array, or empty string
  const modelToUse = tool.models && tool.models.length > 0 ? tool.models[0] : '';
  
  console.log(`[callLLM] Calling ${tool.title}`, {
    endpoint,
    model: modelToUse,
    hasApiKey: !!tool.apiKey,
    hasRequestBodyTemplate: !!tool.requestBodyTemplate,
    hasResponsePath: !!tool.responsePath
  });

  // Build headers
  const headers = {
    'Content-Type': 'application/json',
    ...(tool.apiHeaders || {})
  };

  // Replace API key placeholder in headers if present
  Object.keys(headers).forEach(key => {
    if (typeof headers[key] === 'string') {
      headers[key] = headers[key].replace('{{apiKey}}', tool.apiKey);
    }
  });

  // If Authorization header is not set, try to add it
  if (!headers['Authorization'] && !headers['authorization'] && !headers['x-api-key']) {
    // Default to Bearer token if no auth header specified
    headers['Authorization'] = `Bearer ${tool.apiKey}`;
  }

  // Build request body
  let requestBody;
  
  if (tool.requestBodyTemplate && Object.keys(tool.requestBodyTemplate).length > 0) {
    // Use the template from database
    const values = {
      apiKey: tool.apiKey,
      prompt: prompt || '',
      inputText: prompt || '', // For compatibility
      model: modelToUse,
      inputFiles: []
    };
    requestBody = replacePlaceholders(tool.requestBodyTemplate, values);
    console.log(`[callLLM] Using requestBodyTemplate:`, JSON.stringify(requestBody, null, 2));
  } else {
    // If this is an OpenAI Images endpoint (DALL·E), the payload is NOT chat-completions.
    if (endpoint.includes("/v1/images/generations")) {
      requestBody = {
        // OpenAI supports: "dall-e-2", "dall-e-3" (and newer image models depending on account)
        ...(modelToUse ? { model: modelToUse } : {}),
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      };
    } else if (endpoint.includes("groq.com") || endpoint.includes("openai.com") || modelToUse) {
      // Default format for Groq/OpenAI-compatible chat-completions APIs
      requestBody = {
        model: modelToUse || "llama-3.3-70b-versatile", // Default Groq model
        messages: [{ role: "user", content: prompt }],
      };
    } else {
      // Fallback simple format
      requestBody = { prompt: prompt, ...(modelToUse && { model: modelToUse }) };
    }
    console.log(`[callLLM] Using default request body:`, JSON.stringify(requestBody, null, 2));
  }

  try {
    const response = await axios.post(
      endpoint,
      requestBody,
      { headers }
    );

    console.log(`[callLLM] Response received:`, {
      status: response.status,
      hasData: !!response.data,
      responseKeys: response.data ? Object.keys(response.data) : []
    });

    // Extract response using responsePath if specified
    if (tool.responsePath) {
      const extracted = getNestedValue(response.data, tool.responsePath);
      if (extracted != null) {
        return extracted;
      }
    }

    // Try common response patterns (chat + images)
    const output = response.data.output || 
                   response.data.text || 
                   response.data.content || 
                   response.data.data?.[0]?.url ||
                   response.data.data?.[0]?.b64_json ||
                   response.data.choices?.[0]?.message?.content ||
                   response.data.choices?.[0]?.text ||
                   response.data;

    return typeof output === 'string' ? output : JSON.stringify(output);
  } catch (error) {
    console.error(`[callLLM] Error calling ${tool.title}:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      endpoint,
      requestBody: JSON.stringify(requestBody, null, 2)
    });
    
    if (error.response?.data) {
      const errorMsg = error.response.data.error?.message || 
                      error.response.data.message || 
                      error.response.data.error ||
                      error.message;
      // Don't double-prefix "API Error:" — caller wraps it for UI.
      throw new Error(errorMsg);
    }
    throw error;
  }
};

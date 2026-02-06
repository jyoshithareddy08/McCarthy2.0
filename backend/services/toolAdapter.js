import Tool from '../models/Tool.js';

/**
 * Get value from nested object using dot notation path
 * @param {Object} obj - Object to traverse
 * @param {string} path - Dot notation path (e.g., "choices[0].message.content")
 * @returns {any}
 */
function getNestedValue(obj, path) {
  if (!path) return null;
  
  // Handle array notation like "choices[0].message.content"
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let result = obj;
  
  for (const part of parts) {
    if (result === null || result === undefined) return null;
    result = result[part];
  }
  
  return result;
}

/**
 * Replace placeholders in template with actual values
 * @param {any} template - Template object/string
 * @param {Object} values - Values to replace
 * @returns {any}
 */
function replacePlaceholders(template, values) {
  if (typeof template === 'string') {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return values[key] !== undefined ? values[key] : match;
    });
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
 * Execute tool using user-provided endpoint configuration
 */
async function executeToolAPI(tool, prompt, normalizedInput, selectedModel = null) {
  const apiKey = tool.apiKey;
  const apiEndpoint = tool.apiEndpoint;
  const apiMethod = tool.apiMethod || 'POST';
  const apiHeaders = tool.apiHeaders || {};
  const requestBodyTemplate = tool.requestBodyTemplate || {};
  const responsePath = tool.responsePath;

  if (!apiEndpoint) {
    throw new Error(`API endpoint is required for tool: ${tool.title}`);
  }

  if (!apiKey) {
    throw new Error(`API key is required for tool: ${tool.title}`);
  }

  // Build headers
  const headers = {
    'Content-Type': 'application/json',
    ...apiHeaders
  };

  // Replace API key placeholder in headers if present
  Object.keys(headers).forEach(key => {
    if (typeof headers[key] === 'string') {
      headers[key] = headers[key].replace('{{apiKey}}', apiKey);
    }
  });

  // If Authorization header is not set, try to add it
  if (!headers['Authorization'] && !headers['authorization'] && !headers['x-api-key']) {
    // Default to Bearer token if no auth header specified
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  // Use selected model, or first model from array, or empty string
  const modelToUse = selectedModel || (tool.models && tool.models.length > 0 ? tool.models[0] : '');
  
  // Build request body from template
  const values = {
    apiKey: apiKey,
    prompt: prompt || '',
    inputText: normalizedInput.text || '',
    model: modelToUse,
    inputFiles: normalizedInput.files || []
  };

  let requestBody = replacePlaceholders(requestBodyTemplate, values);

  // If no template provided, use a simple default structure
  if (!requestBodyTemplate || Object.keys(requestBodyTemplate).length === 0) {
    requestBody = {
      prompt: prompt || '',
      input: normalizedInput.text || '',
      ...(modelToUse && { model: modelToUse })
    };
  }

  // Make API call
  const fetchOptions = {
    method: apiMethod,
    headers: headers
  };

  // Only add body for methods that support it
  if (['POST', 'PUT', 'PATCH'].includes(apiMethod)) {
    fetchOptions.body = JSON.stringify(requestBody);
  } else if (apiMethod === 'GET') {
    // For GET requests, append query parameters to URL
    const url = new URL(apiEndpoint);
    Object.entries(requestBody).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
    const response = await fetch(url.toString(), fetchOptions);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`API error: ${error.error?.message || error.message || response.statusText}`);
    }

    const data = await response.json();
    const outputText = responsePath ? getNestedValue(data, responsePath) : JSON.stringify(data);

    return {
      outputText: outputText || null,
      outputFiles: normalizedInput.files || []
    };
  }

  const response = await fetch(apiEndpoint, fetchOptions);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(`API error: ${error.error?.message || error.message || response.statusText}`);
  }

  const data = await response.json();
  
  // Extract output using response path if specified
  let outputText = null;
  if (responsePath) {
    outputText = getNestedValue(data, responsePath);
  } else {
    // Try common response patterns
    outputText = data.text || data.content || data.output || data.result || data.message || JSON.stringify(data);
  }

  // Handle file outputs if present
  let outputFiles = normalizedInput.files || [];
  if (data.files || data.images || data.urls) {
    const files = data.files || data.images || data.urls;
    if (Array.isArray(files)) {
      outputFiles = [...outputFiles, ...files];
    }
  }

  return {
    outputText: outputText || null,
    outputFiles: outputFiles
  };
}

/**
 * Execute a tool/LLM with the given inputs
 * @param {Object} params
 * @param {string} params.toolId - Tool ID
 * @param {string} params.prompt - Segment prompt
 * @param {string|null} params.inputText - Input text
 * @param {string[]} params.inputFiles - Input file URLs
 * @param {string|null} params.model - Optional: specific model to use (must be in tool.models array)
 * @returns {Promise<{outputText: string|null, outputFiles: string[]}>}
 */
export async function executeTool({ toolId, prompt, inputText, inputFiles = [], model: selectedModel = null }) {
  try {
    // Fetch tool with API key from database
    const tool = await Tool.findById(toolId).select('+apiKey');
    
    if (!tool) {
      throw new Error(`Tool with ID ${toolId} not found`);
    }

    if (!tool.apiKey) {
      throw new Error(`API key not found for tool: ${tool.title}`);
    }

    // Normalize input
    const normalizedInput = {
      text: inputText || null,
      files: inputFiles || []
    };

    // Validate that apiEndpoint is provided (required field)
    if (!tool.apiEndpoint) {
      throw new Error(`API endpoint is required for tool: ${tool.title}. Please configure the apiEndpoint field.`);
    }

    // Use user-provided endpoint directly - no manual endpoint building
    // All tools use the unified handler with the user's endpoint
    const result = await executeToolAPI(tool, prompt, normalizedInput, selectedModel);

    // Normalize output
    return {
      outputText: result.outputText || null,
      outputFiles: result.outputFiles || []
    };
  } catch (error) {
    // Enhanced error handling
    if (error.message.includes('API key')) {
      throw new Error(`Authentication failed: ${error.message}`);
    } else if (error.message.includes('rate limit') || error.message.includes('429')) {
      throw new Error('API rate limit exceeded. Please try again later.');
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      throw new Error('Network error: Could not connect to API service.');
    } else {
      throw new Error(`Tool execution failed: ${error.message}`);
    }
  }
}

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
 * Execute OpenAI tool (GPT-4, DALL-E, Whisper)
 */
async function executeOpenAI(tool, prompt, normalizedInput, selectedModel = null) {
  const { toolType } = detectProviderAndType(tool);
  const apiKey = tool.apiKey;

  if (!apiKey) {
    throw new Error('OpenAI API key is missing');
  }

  // Image generation (DALL-E)
  if (toolType === 'image-generation') {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: normalizedInput.text || prompt,
        n: 1,
        size: '1024x1024'
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0]?.url;

    return {
      outputText: `Image generated: ${normalizedInput.text || prompt}`,
      outputFiles: imageUrl ? [imageUrl] : []
    };
  }

  // Speech-to-text (Whisper)
  if (toolType === 'transcription') {
    // For Whisper, we'd need to handle audio file uploads
    // This is a simplified version - in production, you'd need to:
    // 1. Download the audio file from inputFiles
    // 2. Upload it to OpenAI's API
    if (normalizedInput.files.length === 0) {
      throw new Error('Whisper requires an audio file input');
    }

    // Note: This is a placeholder - actual implementation would need file handling
    throw new Error('Whisper transcription requires file upload handling (not yet implemented)');
  }

  // Chat completion (GPT-4, GPT-3.5, etc.)
  const messages = [];
  if (prompt) {
    messages.push({ role: 'system', content: prompt });
  }
  if (normalizedInput.text) {
    messages.push({ role: 'user', content: normalizedInput.text });
  }

  // Use selected model, or first model from array, or detect from tool metadata
  let model = selectedModel;
  if (!model && tool.models && tool.models.length > 0) {
    model = tool.models[0]; // Use first model as default
  }
  if (!model) {
    // Fallback: detect from tool metadata
    const toolText = `${tool.title} ${tool.keywords?.join(' ')}`.toLowerCase();
    if (toolText.includes('gpt-3.5') || toolText.includes('gpt-3')) {
      model = 'gpt-3.5-turbo';
    } else if (toolText.includes('gpt-4-turbo')) {
      model = 'gpt-4-turbo-preview';
    } else if (toolText.includes('gpt-4')) {
      model = 'gpt-4';
    } else {
      model = 'gpt-4'; // Ultimate fallback
    }
  }
  
  // Validate selected model is in the tool's models array (if array exists)
  if (tool.models && tool.models.length > 0 && !tool.models.includes(model)) {
    throw new Error(`Model "${model}" is not available for this tool. Available models: ${tool.models.join(', ')}`);
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: messages
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const outputText = data.choices[0]?.message?.content || null;

  return {
    outputText,
    outputFiles: normalizedInput.files || []
  };
}

/**
 * Execute Anthropic Claude tool
 */
async function executeAnthropic(tool, prompt, normalizedInput, selectedModel = null) {
  const apiKey = tool.apiKey;

  if (!apiKey) {
    throw new Error('Anthropic API key is missing');
  }

  // Use selected model, or first model from array, or detect from tool metadata
  let model = selectedModel;
  if (!model && tool.models && tool.models.length > 0) {
    model = tool.models[0]; // Use first model as default
  }
  if (!model) {
    // Fallback: detect from tool metadata
    const toolText = `${tool.title} ${tool.keywords?.join(' ')}`.toLowerCase();
    if (toolText.includes('claude-3-sonnet')) {
      model = 'claude-3-sonnet-20240229';
    } else if (toolText.includes('claude-3-haiku')) {
      model = 'claude-3-haiku-20240307';
    } else if (toolText.includes('claude-3-opus')) {
      model = 'claude-3-opus-20240229';
    } else {
      model = 'claude-3-opus-20240229'; // Ultimate fallback
    }
  }
  
  // Validate selected model is in the tool's models array (if array exists)
  if (tool.models && tool.models.length > 0 && !tool.models.includes(model)) {
    throw new Error(`Model "${model}" is not available for this tool. Available models: ${tool.models.join(', ')}`);
  }

  const messages = [];
  if (normalizedInput.text) {
    messages.push({
      role: 'user',
      content: normalizedInput.text
    });
  }

  const systemPrompt = prompt || 'You are a helpful assistant.';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const outputText = data.content[0]?.text || null;

  return {
    outputText,
    outputFiles: normalizedInput.files || []
  };
}

/**
 * Execute Google Gemini tool
 */
async function executeGoogle(tool, prompt, normalizedInput, selectedModel = null) {
  const apiKey = tool.apiKey;

  if (!apiKey) {
    throw new Error('Google API key is missing');
  }

  // Use selected model, or first model from array, or detect from tool metadata
  let model = selectedModel;
  if (!model && tool.models && tool.models.length > 0) {
    model = tool.models[0]; // Use first model as default
  }
  if (!model) {
    // Fallback: detect from tool metadata
    const toolText = `${tool.title} ${tool.keywords?.join(' ')}`.toLowerCase();
    if (toolText.includes('gemini-pro-vision') || toolText.includes('multimodal') || toolText.includes('vision')) {
      model = 'gemini-pro-vision';
    } else if (toolText.includes('gemini-pro')) {
      model = 'gemini-pro';
    } else {
      model = 'gemini-pro'; // Ultimate fallback
    }
  }
  
  // Validate selected model is in the tool's models array (if array exists)
  if (tool.models && tool.models.length > 0 && !tool.models.includes(model)) {
    throw new Error(`Model "${model}" is not available for this tool. Available models: ${tool.models.join(', ')}`);
  }

  const contents = [];
  if (normalizedInput.text) {
    contents.push({
      parts: [{ text: normalizedInput.text }]
    });
  }

  const systemInstruction = prompt ? { parts: [{ text: prompt }] } : undefined;

  const requestBody = {
    contents: contents
  };
  if (systemInstruction) {
    requestBody.systemInstruction = systemInstruction;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(`Google API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || null;

  return {
    outputText,
    outputFiles: normalizedInput.files || []
  };
}

/**
 * Execute custom/external API tool using configuration from database
 */
async function executeCustomAPI(tool, prompt, normalizedInput, selectedModel = null) {
  const apiKey = tool.apiKey;
  const apiEndpoint = tool.apiEndpoint;
  const apiMethod = tool.apiMethod || 'POST';
  const apiHeaders = tool.apiHeaders || {};
  const requestBodyTemplate = tool.requestBodyTemplate || {};
  const responsePath = tool.responsePath;

  if (!apiEndpoint) {
    throw new Error(`API endpoint not configured for tool: ${tool.title}. Please set apiEndpoint in the tool configuration.`);
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

    // Get provider from database (defaults to 'custom' if not set)
    let provider = tool.provider || 'custom';

    // Fallback: Auto-detect provider if not set and no custom endpoint configured
    // This ensures backward compatibility with existing tools
    if (provider === 'custom' && !tool.apiEndpoint) {
      const title = (tool.title || '').toLowerCase();
      const description = (tool.description || '').toLowerCase();
      const keywords = (tool.keywords || []).map(k => k.toLowerCase()).join(' ');
      const allText = `${title} ${description} ${keywords}`;

      if (allText.includes('gpt') || allText.includes('openai') || allText.includes('dall-e') || allText.includes('whisper')) {
        provider = 'openai';
      } else if (allText.includes('claude') || allText.includes('anthropic')) {
        provider = 'anthropic';
      } else if (allText.includes('gemini') || allText.includes('google')) {
        provider = 'google';
      }
    }

    // Route to appropriate handler based on provider
    let result;
    switch (provider) {
      case 'openai':
        result = await executeOpenAI(tool, prompt, normalizedInput, selectedModel);
        break;
      case 'anthropic':
        result = await executeAnthropic(tool, prompt, normalizedInput, selectedModel);
        break;
      case 'google':
        result = await executeGoogle(tool, prompt, normalizedInput, selectedModel);
        break;
      case 'custom':
      default:
        // Use custom API configuration from database
        result = await executeCustomAPI(tool, prompt, normalizedInput, selectedModel);
    }

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

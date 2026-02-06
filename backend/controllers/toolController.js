import { executeTool } from '../services/toolAdapter.js';
import Tool from '../models/Tool.js';

/**
 * Test a tool directly
 * POST /api/tools/:toolId/test
 */
export const testTool = async (req, res) => {
  try {
    const { toolId } = req.params;
    const { prompt, inputText, inputFiles = [], model } = req.body;

    // Validate tool exists
    const tool = await Tool.findById(toolId);
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    // Execute the tool
    const result = await executeTool({
      toolId,
      prompt: prompt || 'You are a helpful assistant.',
      inputText: inputText || 'Hello, please respond.',
      inputFiles: inputFiles || [],
      model: model || null
    });

    res.json({
      success: true,
      tool: {
        id: tool._id,
        title: tool.title,
        provider: tool.provider || 'auto-detect'
      },
      result: {
        outputText: result.outputText,
        outputFiles: result.outputFiles
      }
    });
  } catch (error) {
    console.error('Error testing tool:', error);
    
    res.status(500).json({
      success: false,
      error: 'Tool execution failed',
      message: error.message
    });
  }
};

/**
 * List all available tools
 * GET /api/tools
 */
export const listTools = async (req, res) => {
  try {
    const tools = await Tool.find({})
      .select('-apiKey') // Don't return API keys
      .limit(100);

    res.json({
      count: tools.length,
      tools: tools.map(tool => ({
        id: tool._id,
        title: tool.title,
        description: tool.description,
        provider: tool.provider || 'auto-detect',
        models: tool.models || [],
        keywords: tool.keywords || []
      }))
    });
  } catch (error) {
    console.error('Error listing tools:', error);
    res.status(500).json({ error: 'Failed to list tools' });
  }
};

/**
 * Create a new tool (vendor only)
 * POST /api/tools
 */
export const createTool = async (req, res) => {
  try {
    // Check if user is authenticated and is a vendor
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'vendor') {
      return res.status(403).json({ error: 'Only vendors can create tools' });
    }

    const {
      title,
      description,
      apiKey,
      apiEndpoint,
      apiMethod = 'POST',
      apiHeaders,
      requestBodyTemplate,
      responsePath,
      provider = 'custom',
      models = [],
      keywords = [],
      useCases = [],
      alternatives = [],
      image
    } = req.body;

    // Validate required fields
    if (!title || !description || !apiKey || !apiEndpoint) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'description', 'apiKey', 'apiEndpoint']
      });
    }

    // Validate models array
    if (!Array.isArray(models) || models.length === 0) {
      return res.status(400).json({ error: 'At least one model is required' });
    }

    // Create the tool
    const tool = await Tool.create({
      uploadedBy: req.user._id,
      title: title.trim(),
      description: description.trim(),
      apiKey: apiKey.trim(),
      apiEndpoint: apiEndpoint.trim(),
      apiMethod,
      apiHeaders: apiHeaders || null,
      requestBodyTemplate: requestBodyTemplate || null,
      responsePath: responsePath || null,
      provider,
      models: models.map(m => m.trim()).filter(m => m),
      keywords: keywords.map(k => k.trim()).filter(k => k),
      useCases: useCases.map(u => u.trim()).filter(u => u),
      alternatives: alternatives.map(a => a.trim()).filter(a => a),
      image: image || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop'
    });

    // Return tool without API key
    const toolResponse = tool.toObject();
    delete toolResponse.apiKey;

    res.status(201).json({
      message: 'Tool created successfully',
      tool: toolResponse
    });
  } catch (error) {
    console.error('Error creating tool:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({ error: 'Failed to create tool', message: error.message });
  }
};


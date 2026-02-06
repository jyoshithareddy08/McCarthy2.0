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


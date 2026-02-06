import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from '../config/db.js';
import { executeTool } from '../services/toolAdapter.js';
import Tool from '../models/Tool.js';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

/**
 * Test toolAdapter with different scenarios
 */
async function testToolAdapter() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected\n');

    // Get all tools from database
    const tools = await Tool.find({}).limit(5);
    
    if (tools.length === 0) {
      console.log('❌ No tools found in database. Please run seed.js first.');
      process.exit(1);
    }

    console.log(`📋 Found ${tools.length} tools to test\n`);
    console.log('='.repeat(60));

    // Test each tool
    for (const tool of tools) {
      console.log(`\n🧪 Testing Tool: ${tool.title}`);
      console.log(`   Provider: ${tool.provider || 'auto-detect'}`);
      console.log(`   Models: ${tool.models?.join(', ') || 'auto-detect'}`);
      console.log(`   API Endpoint: ${tool.apiEndpoint || 'provider default'}`);
      console.log(`   Request Body Template: ${tool.requestBodyTemplate ? 'Yes' : 'No (using default)'}`);
      console.log(`   Response Path: ${tool.responsePath || 'auto-detect'}`);
      console.log('-'.repeat(60));

      // Select a model from the tool's models array
      let selectedModel = null;
      if (tool.models && tool.models.length > 0) {
        selectedModel = tool.models[0]; // Use first model
        console.log(`   Selected Model: ${selectedModel}`);
      } else {
        console.log(`   ⚠️  No models configured - will use empty model string`);
      }

      try {
        const result = await executeTool({
          toolId: tool._id.toString(),
          prompt: 'You are a helpful assistant. Respond briefly.',
          inputText: 'Say hello in one sentence.',
          inputFiles: [],
          model: selectedModel // Pass the selected model
        });

        console.log('✅ Success!');
        console.log(`   Output Text: ${result.outputText?.substring(0, 200) || 'null'}...`);
        console.log(`   Output Files: ${result.outputFiles?.length || 0} file(s)`);
        if (result.outputFiles && result.outputFiles.length > 0) {
          console.log(`   Files: ${result.outputFiles.join(', ')}`);
        }
      } catch (error) {
        console.log('❌ Error:');
        console.log(`   Message: ${error.message}`);
        // Show more details if available
        if (error.stack) {
          console.log(`   Stack: ${error.stack.split('\n')[1]?.trim() || 'N/A'}`);
        }
      }

      console.log('-'.repeat(60));
      
      // Wait a bit between tests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Testing completed!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testToolAdapter();


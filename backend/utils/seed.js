import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Tool from '../models/Tool.js';
import Session from '../models/Session.js';
import Message from '../models/Message.js';
import Segment from '../models/Segment.js';
import Pipeline from '../models/Pipeline.js';
import SegmentRun from '../models/SegmentRun.js';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the backend directory (parent of utils)
dotenv.config({ path: join(__dirname, '..', '.env') });

// Connect to database
await connectDB();
console.log('Database connected ✅\n');

/* -------------------- CLEAR DB -------------------- */
await Promise.all([
  User.deleteMany({}),
  Tool.deleteMany({}),
  Session.deleteMany({}),
  Message.deleteMany({}),
  Segment.deleteMany({}),
  Pipeline.deleteMany({}),
  SegmentRun.deleteMany({})
]);

console.log('Old data removed 🗑️\n');

/* -------------------- USERS (8 Vendors + 7 Users) -------------------- */
const vendors = await User.insertMany([
  { name: 'Sarah Chen', email: 'sarah.chen@techai.io', password: 'password123', role: 'vendor' },
  { name: 'Michael Rodriguez', email: 'm.rodriguez@devtools.com', password: 'password123', role: 'vendor' },
  { name: 'Emily Watson', email: 'emily.watson@aiworks.com', password: 'password123', role: 'vendor' },
  { name: 'David Kim', email: 'david.kim@smarttools.io', password: 'password123', role: 'vendor' },
  { name: 'Jessica Martinez', email: 'j.martinez@automate.ai', password: 'password123', role: 'vendor' },
  { name: 'Robert Taylor', email: 'robert.taylor@mltools.com', password: 'password123', role: 'vendor' },
  { name: 'Amanda Lee', email: 'amanda.lee@datasolutions.io', password: 'password123', role: 'vendor' },
  { name: 'James Wilson', email: 'james.wilson@cloudai.com', password: 'password123', role: 'vendor' }
]);

const users = await User.insertMany([
  { name: 'Alex Thompson', email: 'alex.thompson@email.com', password: 'password123', role: 'user' },
  { name: 'Maria Garcia', email: 'maria.garcia@email.com', password: 'password123', role: 'user' },
  { name: 'John Anderson', email: 'john.anderson@email.com', password: 'password123', role: 'user' },
  { name: 'Lisa Brown', email: 'lisa.brown@email.com', password: 'password123', role: 'user' },
  { name: 'Chris Davis', email: 'chris.davis@email.com', password: 'password123', role: 'user' },
  { name: 'Jennifer White', email: 'jennifer.white@email.com', password: 'password123', role: 'user' },
  { name: 'Daniel Moore', email: 'daniel.moore@email.com', password: 'password123', role: 'user' }
]);

console.log('Users created ✅ (8 vendors, 7 users)\n');

/* -------------------- TOOLS (30 Realistic Tools) -------------------- */
const tools = await Tool.insertMany([
  {
    uploadedBy: vendors[0]._id,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    title: 'GPT-4 Chat Assistant',
    description: 'Advanced conversational AI powered by GPT-4. Perfect for customer support, content generation, and interactive applications.',
    apiKey: 'sk-gpt4-api-key-001',
    provider: 'openai',
    models: ['gpt-4', 'gpt-4-turbo-preview', 'gpt-3.5-turbo'],
    keywords: ['chatbot', 'gpt-4', 'conversational-ai', 'customer-support'],
    useCases: ['Customer service automation', 'Content writing', 'Code generation', 'Question answering'],
    alternatives: ['Claude AI', 'Gemini Pro', 'LLaMA 2']
  },
  {
    uploadedBy: vendors[0]._id,
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop',
    title: 'DALL-E Image Generator',
    description: 'Generate high-quality images from text descriptions using OpenAI\'s DALL-E model. Create artwork, illustrations, and visual content.',
    apiKey: 'sk-dalle-api-key-002',
    provider: 'openai',
    models: ['dall-e-3', 'dall-e-2'],
    keywords: ['image-generation', 'dall-e', 'art', 'visual-content'],
    useCases: ['Marketing visuals', 'Product mockups', 'Creative artwork', 'Social media content'],
    alternatives: ['Midjourney', 'Stable Diffusion', 'Adobe Firefly']
  },
  {
    uploadedBy: vendors[1]._id,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    title: 'Claude Document Analyzer',
    description: 'Analyze and summarize documents with Anthropic\'s Claude. Extract insights, answer questions, and process long-form content.',
    apiKey: 'sk-claude-api-key-003',
    provider: 'anthropic',
    models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    keywords: ['document-analysis', 'claude', 'summarization', 'text-processing'],
    useCases: ['Legal document review', 'Research paper analysis', 'Contract summarization', 'Content extraction'],
    alternatives: ['GPT-4', 'Gemini', 'Jurassic-2']
  },
  {
    uploadedBy: vendors[1]._id,
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
    title: 'Whisper Speech-to-Text',
    description: 'Convert audio and video to accurate text transcripts using OpenAI Whisper. Supports multiple languages and audio formats.',
    apiKey: 'sk-whisper-api-key-004',
    provider: 'openai',
    models: ['whisper-1'],
    keywords: ['speech-to-text', 'transcription', 'audio-processing', 'whisper'],
    useCases: ['Meeting transcription', 'Podcast transcripts', 'Video subtitles', 'Voice notes'],
    alternatives: ['Google Speech-to-Text', 'Azure Speech', 'AssemblyAI']
  },
  {
    uploadedBy: vendors[2]._id,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    title: 'Gemini Pro Multimodal',
    description: 'Google\'s Gemini Pro for text, image, and video understanding. Process multiple content types in a single request.',
    apiKey: 'sk-gemini-api-key-005',
    provider: 'google',
    models: ['gemini-pro', 'gemini-pro-vision'],
    keywords: ['multimodal', 'gemini', 'google-ai', 'vision'],
    useCases: ['Image analysis', 'Video understanding', 'Content moderation', 'Multimedia search'],
    alternatives: ['GPT-4 Vision', 'Claude 3', 'LLaVA']
  },
  {
    uploadedBy: vendors[2]._id,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    title: 'Code Interpreter Assistant',
    description: 'Execute Python code, analyze data, and generate visualizations. Perfect for data science and automation tasks.',
    apiKey: 'sk-code-api-key-006',
    keywords: ['code-execution', 'python', 'data-analysis', 'automation'],
    useCases: ['Data analysis', 'Report generation', 'API automation', 'Script execution'],
    alternatives: ['Jupyter Notebooks', 'Google Colab', 'Replit']
  },
  {
    uploadedBy: vendors[3]._id,
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
    title: 'PDF Document Processor',
    description: 'Extract text, tables, and data from PDF documents. Support for scanned documents with OCR capabilities.',
    apiKey: 'sk-pdf-api-key-007',
    keywords: ['pdf-processing', 'ocr', 'document-extraction', 'data-extraction'],
    useCases: ['Invoice processing', 'Form extraction', 'Document digitization', 'Data entry automation'],
    alternatives: ['Adobe Acrobat', 'Tabula', 'PyPDF2']
  },
  {
    uploadedBy: vendors[3]._id,
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop',
    title: 'Email Content Generator',
    description: 'Generate professional emails, responses, and marketing content. Tone-aware writing for business communication.',
    apiKey: 'sk-email-api-key-008',
    keywords: ['email-generation', 'content-writing', 'business-communication', 'copywriting'],
    useCases: ['Email campaigns', 'Customer responses', 'Newsletter content', 'Follow-up emails'],
    alternatives: ['Grammarly', 'Jasper', 'Copy.ai']
  },
  {
    uploadedBy: vendors[4]._id,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    title: 'Translation Service Pro',
    description: 'Translate text between 100+ languages with high accuracy. Context-aware translations for professional use.',
    apiKey: 'sk-translate-api-key-009',
    keywords: ['translation', 'multilingual', 'localization', 'language-processing'],
    useCases: ['Website localization', 'Document translation', 'Customer support', 'Content localization'],
    alternatives: ['Google Translate', 'DeepL', 'Microsoft Translator']
  },
  {
    uploadedBy: vendors[4]._id,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    title: 'Sentiment Analysis API',
    description: 'Analyze sentiment, emotions, and tone in text. Perfect for social media monitoring and customer feedback analysis.',
    apiKey: 'sk-sentiment-api-key-010',
    keywords: ['sentiment-analysis', 'nlp', 'emotion-detection', 'text-analysis'],
    useCases: ['Social media monitoring', 'Customer feedback', 'Review analysis', 'Brand reputation'],
    alternatives: ['AWS Comprehend', 'Google Cloud NLP', 'IBM Watson']
  },
  {
    uploadedBy: vendors[5]._id,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    title: 'Video Summarizer AI',
    description: 'Generate summaries and transcripts from video content. Extract key moments and create time-stamped highlights.',
    apiKey: 'sk-video-api-key-011',
    keywords: ['video-analysis', 'summarization', 'video-processing', 'content-extraction'],
    useCases: ['Video content analysis', 'Meeting summaries', 'Educational content', 'Content moderation'],
    alternatives: ['YouTube Transcript', 'Descript', 'Otter.ai']
  },
  {
    uploadedBy: vendors[5]._id,
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
    title: 'Code Review Assistant',
    description: 'Automated code review with security scanning, bug detection, and best practice suggestions. Supports multiple languages.',
    apiKey: 'sk-code-review-api-key-012',
    keywords: ['code-review', 'security-scanning', 'bug-detection', 'code-quality'],
    useCases: ['Code quality checks', 'Security audits', 'Bug prevention', 'Best practices'],
    alternatives: ['SonarQube', 'CodeClimate', 'Snyk']
  },
  {
    uploadedBy: vendors[6]._id,
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop',
    title: 'Resume Parser & Analyzer',
    description: 'Extract and analyze resume data. Match candidates to job requirements and generate candidate profiles.',
    apiKey: 'sk-resume-api-key-013',
    keywords: ['resume-parsing', 'recruitment', 'talent-acquisition', 'hr-automation'],
    useCases: ['ATS integration', 'Candidate screening', 'Resume database', 'Talent matching'],
    alternatives: ['Greenhouse', 'Lever', 'Workday']
  },
  {
    uploadedBy: vendors[6]._id,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    title: 'Invoice Data Extractor',
    description: 'Automatically extract data from invoices, receipts, and financial documents. Export to accounting systems.',
    apiKey: 'sk-invoice-api-key-014',
    keywords: ['invoice-processing', 'receipt-ocr', 'financial-automation', 'expense-management'],
    useCases: ['Accounts payable', 'Expense reporting', 'Financial auditing', 'Bookkeeping automation'],
    alternatives: ['QuickBooks', 'Xero', 'FreshBooks']
  },
  {
    uploadedBy: vendors[7]._id,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    title: 'Social Media Content Creator',
    description: 'Generate engaging social media posts, captions, and hashtags. Optimized for different platforms and audiences.',
    apiKey: 'sk-social-api-key-015',
    keywords: ['social-media', 'content-creation', 'marketing', 'copywriting'],
    useCases: ['Content calendar', 'Post generation', 'Hashtag research', 'Engagement optimization'],
    alternatives: ['Hootsuite', 'Buffer', 'Later']
  },
  {
    uploadedBy: vendors[0]._id,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    title: 'Meeting Notes Generator',
    description: 'Transform meeting recordings into structured notes, action items, and summaries. Integrate with calendar systems.',
    apiKey: 'sk-meeting-api-key-016',
    keywords: ['meeting-notes', 'transcription', 'productivity', 'collaboration'],
    useCases: ['Team meetings', 'Client calls', 'Interview notes', 'Project updates'],
    alternatives: ['Otter.ai', 'Fireflies', 'Notion AI']
  },
  {
    uploadedBy: vendors[1]._id,
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
    title: 'Product Description Writer',
    description: 'Create compelling product descriptions for e-commerce. SEO-optimized and conversion-focused content.',
    apiKey: 'sk-product-api-key-017',
    keywords: ['e-commerce', 'product-descriptions', 'seo', 'copywriting'],
    useCases: ['Online stores', 'Marketplace listings', 'Catalog management', 'SEO optimization'],
    alternatives: ['Jasper', 'Copy.ai', 'Writesonic']
  },
  {
    uploadedBy: vendors[2]._id,
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop',
    title: 'Legal Document Analyzer',
    description: 'Analyze contracts, agreements, and legal documents. Extract clauses, identify risks, and generate summaries.',
    apiKey: 'sk-legal-api-key-018',
    keywords: ['legal-tech', 'contract-analysis', 'compliance', 'document-review'],
    useCases: ['Contract review', 'Due diligence', 'Compliance checking', 'Risk assessment'],
    alternatives: ['LegalZoom', 'DocuSign', 'Ironclad']
  },
  {
    uploadedBy: vendors[3]._id,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    title: 'Customer Support Bot',
    description: 'Intelligent chatbot for customer support. Handle common queries, escalate issues, and provide 24/7 assistance.',
    apiKey: 'sk-support-api-key-019',
    keywords: ['customer-support', 'chatbot', 'automation', 'helpdesk'],
    useCases: ['FAQ automation', 'Ticket routing', 'First-line support', 'Customer engagement'],
    alternatives: ['Intercom', 'Zendesk', 'Freshdesk']
  },
  {
    uploadedBy: vendors[4]._id,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    title: 'Blog Post Generator',
    description: 'Create SEO-optimized blog posts, articles, and long-form content. Research-backed and engaging writing.',
    apiKey: 'sk-blog-api-key-020',
    keywords: ['content-writing', 'blogging', 'seo', 'article-generation'],
    useCases: ['Content marketing', 'SEO content', 'Thought leadership', 'Content calendar'],
    alternatives: ['Jasper', 'Copy.ai', 'Writesonic']
  },
  {
    uploadedBy: vendors[5]._id,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    title: 'Data Visualization Generator',
    description: 'Create charts, graphs, and visualizations from data. Export to multiple formats and embed in reports.',
    apiKey: 'sk-viz-api-key-021',
    keywords: ['data-visualization', 'charts', 'analytics', 'reporting'],
    useCases: ['Business reports', 'Data analysis', 'Presentations', 'Dashboards'],
    alternatives: ['Tableau', 'Power BI', 'Google Data Studio']
  },
  {
    uploadedBy: vendors[6]._id,
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
    title: 'API Documentation Generator',
    description: 'Automatically generate API documentation from code. Create interactive docs with examples and testing tools.',
    apiKey: 'sk-api-doc-api-key-022',
    keywords: ['api-documentation', 'developer-tools', 'technical-writing', 'swagger'],
    useCases: ['API documentation', 'Developer onboarding', 'Integration guides', 'Technical specs'],
    alternatives: ['Swagger', 'Postman', 'ReadMe']
  },
  {
    uploadedBy: vendors[7]._id,
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop',
    title: 'Email Classification System',
    description: 'Automatically categorize and route emails. Detect spam, prioritize messages, and suggest responses.',
    apiKey: 'sk-email-class-api-key-023',
    keywords: ['email-management', 'classification', 'automation', 'productivity'],
    useCases: ['Email triage', 'Spam detection', 'Priority routing', 'Response suggestions'],
    alternatives: ['Gmail Filters', 'Outlook Rules', 'SaneBox']
  },
  {
    uploadedBy: vendors[0]._id,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    title: 'Text Summarization Engine',
    description: 'Summarize long documents, articles, and content. Extract key points and generate concise summaries.',
    apiKey: 'sk-summarize-api-key-024',
    keywords: ['summarization', 'text-processing', 'nlp', 'content-analysis'],
    useCases: ['Research papers', 'News articles', 'Meeting notes', 'Document review'],
    alternatives: ['SMMRY', 'Resoomer', 'TLDR This']
  },
  {
    uploadedBy: vendors[1]._id,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    title: 'Keyword Research Tool',
    description: 'Discover high-value keywords, analyze competition, and generate SEO-optimized content suggestions.',
    apiKey: 'sk-keyword-api-key-025',
    keywords: ['seo', 'keyword-research', 'content-optimization', 'marketing'],
    useCases: ['SEO strategy', 'Content planning', 'Competitor analysis', 'Ad campaigns'],
    alternatives: ['Ahrefs', 'SEMrush', 'Moz']
  },
  {
    uploadedBy: vendors[2]._id,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    title: 'Voice Cloning API',
    description: 'Clone voices for text-to-speech applications. Create natural-sounding audio content with custom voices.',
    apiKey: 'sk-voice-api-key-026',
    keywords: ['voice-cloning', 'text-to-speech', 'audio-generation', 'synthetic-media'],
    useCases: ['Audiobook production', 'Voiceovers', 'Accessibility', 'Content creation'],
    alternatives: ['ElevenLabs', 'Murf', 'Descript']
  },
  {
    uploadedBy: vendors[3]._id,
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
    title: 'Fraud Detection System',
    description: 'Detect fraudulent transactions, accounts, and activities using machine learning and pattern recognition.',
    apiKey: 'sk-fraud-api-key-027',
    keywords: ['fraud-detection', 'security', 'risk-analysis', 'ml'],
    useCases: ['Payment fraud', 'Account security', 'Transaction monitoring', 'Risk assessment'],
    alternatives: ['Sift', 'Kount', 'Signifyd']
  },
  {
    uploadedBy: vendors[4]._id,
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop',
    title: 'Content Moderation API',
    description: 'Automatically moderate user-generated content. Detect inappropriate text, images, and videos.',
    apiKey: 'sk-moderation-api-key-028',
    keywords: ['content-moderation', 'safety', 'compliance', 'automation'],
    useCases: ['Social platforms', 'Comment moderation', 'User safety', 'Compliance'],
    alternatives: ['AWS Rekognition', 'Google Cloud Vision', 'Sightengine']
  },
  {
    uploadedBy: vendors[5]._id,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    title: 'Lead Qualification Bot',
    description: 'Qualify leads through conversational AI. Ask qualifying questions and score leads automatically.',
    apiKey: 'sk-lead-api-key-029',
    keywords: ['lead-qualification', 'sales-automation', 'crm', 'conversational-ai'],
    useCases: ['Lead scoring', 'Sales qualification', 'CRM integration', 'Pipeline management'],
    alternatives: ['HubSpot', 'Salesforce', 'Pipedrive']
  },
  {
    uploadedBy: vendors[6]._id,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    title: 'Code Documentation Writer',
    description: 'Generate comprehensive code documentation from source code. Create README files, API docs, and comments.',
    apiKey: 'sk-code-doc-api-key-030',
    keywords: ['code-documentation', 'developer-tools', 'technical-writing', 'automation'],
    useCases: ['Code documentation', 'API documentation', 'Onboarding', 'Maintenance'],
    alternatives: ['JSDoc', 'Sphinx', 'Doxygen']
  }
]);

console.log('Tools created ✅ (30 tools)\n');

/* -------------------- SESSIONS & MESSAGES -------------------- */
const conversations = [
  // Conversation 1: GPT-4 Chat Assistant
  [
    { prompt: 'What can you help me with?', response: 'I can assist you with a wide range of tasks including answering questions, writing content, analyzing data, generating code, and much more. What would you like to work on today?' },
    { prompt: 'Can you help me write a professional email?', response: 'Absolutely! I\'d be happy to help you write a professional email. Could you provide me with the recipient, purpose of the email, and any key points you\'d like to include?' },
    { prompt: 'It\'s to my manager about requesting time off next week', response: 'Here\'s a professional email draft:\n\nSubject: Time Off Request - [Your Name]\n\nDear [Manager\'s Name],\n\nI hope this email finds you well. I would like to request time off from [start date] to [end date] next week.\n\nI have ensured that all my current projects are up to date and will coordinate with the team to ensure a smooth transition during my absence.\n\nThank you for considering my request. Please let me know if you need any additional information.\n\nBest regards,\n[Your Name]' }
  ],
  // Conversation 2: DALL-E Image Generator
  [
    { prompt: 'How do I generate an image?', response: 'To generate an image, simply describe what you\'d like to see in natural language. For example, "a serene mountain landscape at sunset" or "a futuristic city with flying cars." I\'ll create a unique image based on your description.' },
    { prompt: 'Can you create an image of a modern office space?', response: 'I\'ve generated an image of a modern office space with clean lines, natural lighting, and contemporary furniture. The image features an open-plan layout with collaborative workspaces and ergonomic design elements.' },
    { prompt: 'Make it more minimalist', response: 'I\'ve updated the image to a more minimalist design. The new version features clean white walls, minimal furniture, simple geometric shapes, and lots of open space with natural light. Very Scandinavian-inspired!' }
  ],
  // Conversation 3: Document Analyzer
  [
    { prompt: 'What types of documents can you analyze?', response: 'I can analyze various document types including PDFs, Word documents, text files, and more. I can extract key information, summarize content, answer questions about the document, and identify important sections.' },
    { prompt: 'Can you summarize a 50-page research paper?', response: 'Yes, I can summarize long documents. I\'ll identify the main research question, methodology, key findings, and conclusions. Would you like to upload the document, or do you have specific sections you\'d like me to focus on?' },
    { prompt: 'Focus on the methodology and results', response: 'I\'ll analyze the methodology section to understand the research approach, data collection methods, and experimental design. Then I\'ll extract and summarize the key results, including statistical findings and their significance. Please share the document when ready.' }
  ],
  // Conversation 4: Code Interpreter
  [
    { prompt: 'What programming languages do you support?', response: 'I primarily support Python for code execution. I can help with data analysis using pandas, create visualizations with matplotlib, perform calculations, manipulate data, and run various Python scripts.' },
    { prompt: 'Can you analyze a CSV file?', response: 'Absolutely! I can read CSV files, perform data analysis, generate statistics, create visualizations, and identify patterns. Just upload your CSV file and let me know what analysis you\'d like to perform.' },
    { prompt: 'Create a bar chart of sales by month', response: 'I\'ll analyze your CSV file, extract the sales data grouped by month, and create a professional bar chart visualization. The chart will show monthly sales trends with clear labels and formatting.' }
  ],
  // Conversation 5: Translation Service
  [
    { prompt: 'How many languages can you translate?', response: 'I support translation between 100+ languages including major world languages like English, Spanish, French, German, Chinese, Japanese, Arabic, and many more. I can handle both common and less common languages.' },
    { prompt: 'Translate "Hello, how are you?" to Spanish', response: 'The translation is: "Hola, ¿cómo estás?"' },
    { prompt: 'Now translate it to French', response: 'In French, it\'s: "Bonjour, comment allez-vous?"' }
  ],
  // Conversation 6: Email Generator
  [
    { prompt: 'Can you help write marketing emails?', response: 'Yes! I can help create engaging marketing emails that are conversion-focused. I can write subject lines, body content, and calls-to-action tailored to your audience and campaign goals.' },
    { prompt: 'Write a welcome email for new customers', response: 'Here\'s a warm welcome email:\n\nSubject: Welcome to [Company Name]! 🎉\n\nHi [Name],\n\nWelcome aboard! We\'re thrilled to have you join the [Company Name] family.\n\nAs a new member, you now have access to [key benefits]. We\'re here to help you succeed, so don\'t hesitate to reach out if you have any questions.\n\nGet started: [link]\n\nBest regards,\nThe [Company Name] Team' },
    { prompt: 'Make it more casual and friendly', response: 'Here\'s a more casual version:\n\nSubject: Hey there! 👋\n\nHi [Name],\n\nWelcome! We\'re so excited you\'re here.\n\nYou\'ve got access to all the good stuff now. If you need anything, just holler - we\'ve got your back!\n\nJump in: [link]\n\nCheers,\n[Company Name] Team' }
  ],
  // Conversation 7: Meeting Notes
  [
    { prompt: 'How do you generate meeting notes?', response: 'I can process meeting recordings or transcripts to create structured notes. I\'ll identify key discussion points, action items, decisions made, and next steps. You can upload audio files or paste transcripts.' },
    { prompt: 'Can you extract action items?', response: 'Yes! I\'ll identify all action items from the meeting, including who is responsible for each task and any deadlines mentioned. I\'ll format them clearly for easy follow-up.' },
    { prompt: 'Create a summary with deadlines', response: 'I\'ll create a comprehensive summary that includes:\n- Meeting overview\n- Key decisions\n- Action items with assignees and deadlines\n- Next meeting date (if mentioned)\n\nThis format makes it easy to track progress and ensure nothing falls through the cracks.' }
  ],
  // Conversation 8: Resume Parser
  [
    { prompt: 'What information can you extract from resumes?', response: 'I can extract contact information, work experience, education, skills, certifications, languages, and other relevant details. I\'ll structure this data for easy integration with ATS systems.' },
    { prompt: 'Can you match candidates to job requirements?', response: 'Yes! I can analyze resumes against job descriptions and provide a match score. I\'ll highlight relevant skills, experience, and qualifications that align with the role.' },
    { prompt: 'Generate a candidate profile summary', response: 'I\'ll create a comprehensive candidate profile that includes:\n- Professional summary\n- Key skills and competencies\n- Years of experience\n- Education background\n- Notable achievements\n\nThis makes it easy to quickly assess candidate fit.' }
  ]
];

// Create sessions and messages for each user
let toolIndex = 0;
for (const user of users) {
  const sessionCount = user._id.toString() < users[3]._id.toString() ? 3 : 2; // First 3 users get 3 sessions, rest get 2

  for (let i = 0; i < sessionCount; i++) {
    const tool = tools[toolIndex % tools.length];
    const conversation = conversations[(toolIndex + i) % conversations.length];
    
    const sessionTitles = [
      `Exploring ${tool.title}`,
      `${tool.title} - Project Work`,
      `Learning ${tool.title}`,
      `${tool.title} Integration`,
      `Testing ${tool.title}`
    ];
    
    const session = await Session.create({
      userId: user._id,
      toolId: [tool._id],
      type: i === 0 ? 'normal' : (Math.random() > 0.5 ? 'normal' : 'playground'),
      chatTitle: sessionTitles[i % sessionTitles.length]
    });

    const messages = await Message.insertMany(
      conversation.map(msg => ({
        sessionId: session._id,
        prompt: msg.prompt,
        response: msg.response,
        files: []
      }))
    );

    session.messages = messages.map(m => m._id);
    await session.save();
    
    toolIndex++;
  }
}

console.log('Sessions and messages created ✅\n');

/* -------------------- DONE -------------------- */
console.log('✅ Database seeded successfully!');
console.log(`   - ${vendors.length} vendors`);
console.log(`   - ${users.length} users`);
console.log(`   - ${tools.length} tools`);
console.log(`   - Sessions and messages created\n`);

process.exit(0);

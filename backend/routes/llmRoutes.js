import express from 'express';
import Tool from '../models/Tool.js';

const router = express.Router();

const SIMILARITY_THRESHOLD = parseFloat(process.env.LLM_SIMILARITY_THRESHOLD || '0.3');
const SIMILARITY_SERVICE_URL =
  process.env.LLM_SIMILARITY_SERVICE_URL || 'http://localhost:8001/similarity';

// Helper to safely use global fetch in Node
const doFetch = (...args) => {
  if (typeof fetch !== 'undefined') {
    return fetch(...args);
  }
  throw new Error('Global fetch is not available. Use Node 18+ or add a fetch polyfill.');
};

// GET /api/llms
// Returns all tools (LLMs) without apiKey
router.get('/', async (req, res, next) => {
  try {
    const tools = await Tool.find().select('-apiKey');
    res.json({ results: tools });
  } catch (err) {
    next(err);
  }
});

// POST /api/llms/search
// Body: { query: string }
// Combines:
//  - case-insensitive title + keyword matches
//  - cosine similarity against useCases via Python microservice
router.post('/search', async (req, res, next) => {
  const { query } = req.body || {};

  try {
    // If no query, just return all tools
    if (!query || !query.trim()) {
      const allTools = await Tool.find().select('-apiKey');
      return res.json({ results: allTools, query: '', source: 'all' });
    }

    const q = query.trim();

    // 1. Text/keyword match (case-insensitive)
    const textMatches = await Tool.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { keywords: { $elemMatch: { $regex: q, $options: 'i' } } },
      ],
    }).select('-apiKey');

    const textMatchMap = new Map(textMatches.map((doc) => [String(doc._id), doc]));

    // 2. Cosine similarity via Python microservice against useCases
    let similarityMatches = [];
    let similarityErrorDetails = null;

    try {
      // Fetch all tools that have useCases
      const toolsWithUseCases = await Tool.find({
        useCases: { $exists: true, $ne: [] },
      }).select('-apiKey');

      if (toolsWithUseCases.length && SIMILARITY_SERVICE_URL) {
        const payload = {
          query: q,
          items: toolsWithUseCases.map((tool) => ({
            id: String(tool._id),
            texts: tool.useCases || [],
          })),
        };

        const response = await doFetch(SIMILARITY_SERVICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Similarity service error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const scores = Array.isArray(data.scores) ? data.scores : [];

        const highSimilarityIds = scores
          .filter((item) => typeof item.score === 'number' && item.score >= SIMILARITY_THRESHOLD)
          .sort((a, b) => b.score - a.score)
          .map((item) => item.id);

        const toolById = new Map(
          toolsWithUseCases.map((tool) => [String(tool._id), tool]),
        );

        similarityMatches = highSimilarityIds
          .map((id) => toolById.get(id))
          .filter(Boolean);
      }
    } catch (similarityError) {
      similarityErrorDetails = similarityError.message || String(similarityError);
      console.error('[LLM Search] Similarity service error:', similarityErrorDetails);
    }

    // 3. Union of textMatches and similarityMatches (by _id)
    const resultMap = new Map();

    for (const doc of textMatches) {
      resultMap.set(String(doc._id), doc);
    }
    for (const doc of similarityMatches) {
      resultMap.set(String(doc._id), doc);
    }

    const results = Array.from(resultMap.values());

    res.json({
      query: q,
      results,
      counts: {
        textMatches: textMatches.length,
        similarityMatches: similarityMatches.length,
        total: results.length,
      },
      similarity: {
        threshold: SIMILARITY_THRESHOLD,
        serviceUrl: SIMILARITY_SERVICE_URL || null,
        error: similarityErrorDetails || null,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;

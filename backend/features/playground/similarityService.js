import axios from "axios";

const SIMILARITY_URL = process.env.SIMILARITY_SERVICE_URL || "http://localhost:8001";

/**
 * Calls the Python similarity microservice to find the best-matching tool for a prompt.
 * @param {string} prompt - User prompt
 * @param {Array<{_id: string, title: string, description: string, useCases?: string[], keywords?: string[]}>} tools
 * @returns {{ toolId: string, score: number } | null}
 */
export const getBestToolForPrompt = async (prompt, tools) => {
  if (!prompt?.trim() || !tools?.length) return null;

  const items = tools.map((t) => ({
    id: String(t._id),
    texts: [
      t.title,
      t.description,
      ...(t.useCases || []),
      ...(t.keywords || []),
    ].filter(Boolean),
  }));

  try {
    const { data } = await axios.post(
      `${SIMILARITY_URL}/similarity`,
      { query: prompt.trim(), items },
      { timeout: 15000 }
    );

    const scores = data?.scores || [];
    if (scores.length === 0) return null;

    const best = { toolId: scores[0].id, score: scores[0].score };
    console.log(
      `[Similarity] prompt="${prompt.slice(0, 50)}..." -> best=${scores[0].id} score=${scores[0].score.toFixed(3)} (top3: ${scores
        .slice(0, 3)
        .map((s) => `${s.id.slice(-6)}:${s.score.toFixed(2)}`)
        .join(", ")})`
    );
    return best;
  } catch (err) {
    console.error("[Similarity] FAILED:", err.code || err.message, "- falling back to first tool");
    return null;
  }
};

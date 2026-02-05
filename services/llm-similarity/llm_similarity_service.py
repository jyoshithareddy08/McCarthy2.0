"""
FastAPI microservice for semantic similarity between user prompts and LLM tools.
Uses sentence-transformers (all-MiniLM-L6-v2) for embeddings + cosine similarity.

Run:
  pip install -r requirements.txt
  uvicorn llm_similarity_service:app --host 0.0.0.0 --port 8001

Expected request from Node.js:
POST /similarity
{
  "query": "generate essay on swach bharat",
  "items": [
    {
      "id": "6984...",
      "texts": ["GPT-4 Chat Assistant", "Advanced conversational AI...", "Content writing", "Code generation"]
    },
    ...
  ]
}

Response:
{
  "scores": [
    { "id": "6984...", "score": 0.72 },
    { "id": "6985...", "score": 0.45 }
  ]
}
"""

from typing import List

from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util


class SimilarityItem(BaseModel):
    id: str
    texts: List[str]


class SimilarityRequest(BaseModel):
    query: str
    items: List[SimilarityItem]


class SimilarityScore(BaseModel):
    id: str
    score: float


class SimilarityResponse(BaseModel):
    scores: List[SimilarityScore]


app = FastAPI(title="LLM Similarity Service", version="1.0.0")

# Load model once at startup
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


@app.get("/health")
def health():
    return {"status": "ok", "model": "all-MiniLM-L6-v2"}


@app.post("/similarity", response_model=SimilarityResponse)
def compute_similarity(payload: SimilarityRequest) -> SimilarityResponse:
    query = payload.query.strip()
    if not query:
        return SimilarityResponse(scores=[])

    # Embed query once
    query_emb = model.encode(query, convert_to_tensor=True)

    scores: List[SimilarityScore] = []

    for item in payload.items:
        # Join title, description, use cases into one text blob
        combined = " ".join(text.strip() for text in item.texts if text and str(text).strip())
        if not combined:
            continue

        item_emb = model.encode(combined, convert_to_tensor=True)
        sim = util.cos_sim(query_emb, item_emb).item()

        scores.append(SimilarityScore(id=item.id, score=float(sim)))

    # Sort by score descending so caller can pick best easily
    scores.sort(key=lambda x: x.score, reverse=True)

    return SimilarityResponse(scores=scores)

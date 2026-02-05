"""
Simple FastAPI microservice for cosine similarity on LLM use cases.

Model: all-MiniLM-L6-v2

Run (example):
  pip install fastapi uvicorn sentence-transformers torch
  uvicorn llm_similarity_service:app --host 0.0.0.0 --port 8001

Expected request from Node:
POST /similarity
{
  "query": "chatbot for customer support",
  "items": [
    { "id": "toolId1", "texts": ["customer support chatbot", "FAQ assistant"] },
    { "id": "toolId2", "texts": ["image generation", "art creation"] }
  ]
}

Response:
{
  "scores": [
    { "id": "toolId1", "score": 0.81 },
    { "id": "toolId2", "score": 0.22 }
  ]
}
"""

from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once at startup
model = SentenceTransformer("all-MiniLM-L6-v2")


@app.get("/health")
def health_check():
    return {"status": "ok", "model": "all-MiniLM-L6-v2"}


@app.post("/similarity", response_model=SimilarityResponse)
def compute_similarity(payload: SimilarityRequest) -> SimilarityResponse:
  query = payload.query.strip()
  if not query:
    return SimilarityResponse(scores=[])

  # Encode the query once (matching working code exactly)
  query_emb = model.encode(query, convert_to_tensor=True)

  scores: List[SimilarityScore] = []

  # Compute similarity (matching working code logic exactly)
  for item in payload.items:
    if not item.texts or len(item.texts) == 0:
      continue

    max_sim = 0.0
    
    for text in item.texts:
      text_clean = text.strip()
      if not text_clean:
        continue
      
      text_emb = model.encode(text_clean, convert_to_tensor=True)
      sim = util.cos_sim(query_emb, text_emb).item()
      if sim > max_sim:
        max_sim = sim
    
    if max_sim > 0:
      scores.append(SimilarityScore(id=item.id, score=float(max_sim)))

  # Sort by score descending (matching working code)
  scores = sorted(scores, key=lambda x: x.score, reverse=True)

  return SimilarityResponse(scores=scores)

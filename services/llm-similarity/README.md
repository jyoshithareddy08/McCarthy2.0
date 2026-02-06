# LLM Similarity Service

Semantic similarity microservice for automatic tool selection in the Playground.

## Setup

```bash
cd services/llm-similarity
pip install -r requirements.txt
```

## Run

```bash
uvicorn llm_similarity_service:app --host 0.0.0.0 --port 8001
```

First run downloads the model (~80MB). Health check: http://localhost:8001/health

# Onboarding Assistant

AI-powered Q&A assistant for new software engineers. Ask questions about the codebase, processes, architecture, and dev setup — and get grounded answers with citations.

Built with LangChain, Google Gemini, ChromaDB, and LangSmith tracing.

## Architecture

```
User Query
    → Embed query (text-embedding-004)
    → Search child chunks in ChromaDB (200-token chunks)
    → Retrieve full parent sections (1000-token chunks) [Parent Document Retrieval]
    → Assemble context + prompt
    → Gemini 1.5 Flash
    → Cited answer
```

## Setup

### 1. Install Python 3.10+

Verify with: `python --version`

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

Required keys:
- `GOOGLE_API_KEY` — from Google AI Studio
- `LANGCHAIN_API_KEY` — from LangSmith (smith.langchain.com)

### 4. Add your documents

Place `.md` or `.pdf` files in the `docs/` folder. Sample documents are included.

### 5. Ingest documents

```bash
python ingest.py
```

This creates `chroma_db/` (vector index) and `parents.json` (parent chunks). Run again whenever you add new documents.

### 6. Start the assistant

```bash
python app.py
```

## Example Questions

- "How do I set up my local development environment?"
- "What is the branching strategy?"
- "Which service owns the orders table?"
- "How do I report a production incident?"

## Tracing

All LLM calls are traced in LangSmith under the project `onboarding-assistant`.
Visit `smith.langchain.com` to view traces, token usage, and latency.

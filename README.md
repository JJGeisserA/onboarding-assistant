# Onboarding Assistant

AI-powered Q&A assistant for new software engineers. Ask questions about the codebase, processes, architecture, and dev setup — and get grounded answers with citations.

Built with LangChain.js, Google Gemini, and LangSmith tracing.

## Architecture

```
User Query
    → Embed query (text-embedding-004)
    → Cosine similarity search over child chunks (200-char chunks)
    → Retrieve full parent sections (1000-char chunks) [Parent Document Retrieval]
    → Assemble context + prompt (LCEL chain)
    → Gemini 2.0 Flash
    → Cited answer
```

## Setup

### 1. Install Node.js 18+

Verify with: `node --version`

### 2. Install dependencies

```bash
npm install --registry https://registry.npmjs.org
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

Required keys:
- `GOOGLE_API_KEY` — from Google AI Studio (aistudio.google.com/apikey)
- `LANGCHAIN_API_KEY` — from LangSmith (smith.langchain.com)

### 4. Add your documents

Place `.md` or `.pdf` files in the `docs/` folder. Sample documents are included.

### 5. Ingest documents

```bash
npm run ingest
```

This creates `vectorstore.json` (vector index) and `parents.json` (parent chunks). Run again whenever you add or update documents.

### 6. Start the assistant

```bash
npm start
```

## Example Questions

- "How do I set up my local development environment?"
- "What is the branching strategy?"
- "Which service owns the orders table?"
- "How do I report a production incident?"

## Tracing

All LLM calls are traced in LangSmith under the project `onboarding-assistant`.
Visit `smith.langchain.com` to view traces, token usage, and latency.
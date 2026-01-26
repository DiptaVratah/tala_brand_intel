# External Integrations

**Analysis Date:** 2026-01-26

## APIs & External Services

**Large Language Models (LLM Orchestration):**
- OpenAI GPT-4o - Primary model for voice analysis and fallback content generation
  - SDK/Client: `openai` npm package v4.103.0
  - Auth: `OPENAI_API_KEY` environment variable
  - Usage: `/api/mirror-voice` (voice analysis), `/api/generate-content` (content), `/api/refine-kits` (alchemy), embeddings (text-embedding-3-small)

- Anthropic Claude Sonnet 4.5 - Secondary model for narrative/emotional analysis (2025-09-29 stable version)
  - SDK/Client: `@anthropic-ai/sdk` npm package v0.71.1
  - Auth: `ANTHROPIC_API_KEY` environment variable
  - Model: `claude-sonnet-4-5-20250929`
  - Usage: Voice subtext extraction (emotional cadence, cognitive tension), narrative content generation for NARRATIVE intent category

- Google Gemini 2.5 Pro - Tertiary model for structured analysis and keyword extraction
  - SDK/Client: `@google/generative-ai` npm package v0.24.1
  - Auth: `GOOGLE_API_KEY` environment variable
  - Model: `gemini-2.5-pro`
  - Usage: Linguistic structure analysis, bridge word generation for voice alchemy, structured intent classification

**Multi-AI Orchestration:**
- Intent Classification: Uses gpt-4o-mini for routing requests (NARRATIVE/STRUCTURED/ACTION)
- Voice Analysis: Parallel extraction - OpenAI (structure), Claude (subtext), Gemini (linguistic patterns)
- Content Generation: Intent-aware routing - Claude for narratives, Gemini for structured, OpenAI for action
- Voice Alchemy: Multi-AI synthesis - OpenAI (JSON schema), Claude (archetype naming), Gemini (bridge words)

## Data Storage

**Databases:**
- MongoDB Atlas (Cloud)
  - Connection: `MONGO_URI` environment variable (mongodb+srv:// format)
  - Client: Mongoose 9.0.1 (ORM) + MongoDB 7.0.0 native driver
  - Database: `pulsecraft_dev` (configured in connection string)
  - Collections managed via Mongoose Schema:
    - `TelemetryLog` - Primary collection for event tracking

**Data Stored (TelemetryLog schema):**
- `userId` (String) - Indexed for fast user lookups, defaults to "anonymous"
- `timestamp` (Date) - Event creation time, auto-set to Date.now()
- `eventType` (String) - MIRROR_VOICE, GENERATE_CONTENT, or REFINE_ALCHEMY
- `inputContext` (String) - User prompt/request (truncated to 500 chars for memory)
- `styleUsed` (String) - Generation style indicator
- `outputData` (Object) - Complete voice kit or generated text response
- `latentProfile` (Object) - Psychological metrics (narrativeMode, emotionalCadence, cognitiveTension, etc.)
- `latentMeta` (Object) - Internal stability/drift analysis (stabilityBand, tensionForm, coherenceType)
- `meta` (Object) - Additional context (archetype, sourceKits)
- `vectorEmbedding` (Array[Number]) - Vector representation of essence for drift analysis

**File Storage:**
- Local filesystem only
- Static frontend served from `pulsecraft_ui/` directory via Express.static()
- No external file storage (S3, Cloud Storage) detected

**Caching:**
- None detected
- No Redis, Memcached, or built-in caching layer
- Every request hits LLM APIs and database

## Authentication & Identity

**Auth Provider:**
- Custom (User-based without formal auth system)
  - Implementation: `userId` passed in request body (client-provided, no validation)
  - No password authentication, sessions, or OAuth
  - Telemetry logs associate events with userId for history tracking
  - User history endpoint: `/api/user-history?userId={userId}` (no access control)

**Security Notes:**
- No JWT or session management
- No user registration/login flow
- All endpoints public (rate limiting is only control)
- userId can be spoofed to access other users' history

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, Datadog, etc.)
- Manual console.error() logging to stdout
- Error responses returned as JSON with error field

**Logs:**
- Approach: Console logging (console.log, console.warn, console.error)
- Logged to stdout/stderr only
- No persistent log storage configured
- Key events logged:
  - LLM API calls and responses
  - Database connection status
  - Embedding generation progress
  - Rate limiting triggers
  - API errors and timeouts

## CI/CD & Deployment

**Hosting:**
- Render.com (inferred from server.js comments about "Render Environment Variables")
- Supports environment variable injection for production

**CI Pipeline:**
- None detected
- No GitHub Actions, GitLab CI, or equivalent
- Manual deployment likely

## Webhooks & Callbacks

**Incoming:**
- None detected
- All endpoints are REST POST/GET, no webhook receivers

**Outgoing:**
- None detected
- No third-party notifications or callbacks
- No event streaming or message queue integrations

## API Rate Limiting

**Applied to Endpoints:**
- `/api/mirror-voice`: 10 requests per 15 minutes per IP (mirrorLimiter)
- `/api/generate-content`: 20 requests per 15 minutes per IP (generateLimiter)
- `/api/refine-kits`: 20 requests per 15 minutes per IP (generateLimiter)
- `/api/user-history`: No rate limiting
- `/api/identity-drift`: No rate limiting

**Rate Limit Response:**
```json
{
  "error": "Too many voice analyses. Please wait 15 minutes to cool down."
}
```

## Environment Configuration

**Required env vars (from `.env`):**
```
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIzaSy...
PORT=3000
MONGO_URI=mongodb+srv://user:pass@host/db?retryWrites=true&w=majority
```

**Optional:**
- `PORT` defaults to 3000 if not set

**Secrets location:**
- `.env` file in project root (should be .gitignored)
- Requires all five variables to function

## Health Check

**Endpoint:**
- `GET /health` - Returns "✅ PulseCraft Backend Online (Universal Identity Edition)"
- No database/dependency checks performed

## Timeout & Retry Logic

**Embeddings (OpenAI):**
- 10-second timeout for vector generation
- Falls through to empty vector array on timeout

**LLM Requests:**
- 60-second timeout for OpenAI requests
- Retry logic with exponential backoff (1s, 2s, 4s) for all three LLM providers
- Up to 3 retry attempts before failure

**Database:**
- No explicit timeout configured
- Mongoose connection pooling handles retries
- Warns on connection failure but doesn't block startup

---

*Integration audit: 2026-01-26*

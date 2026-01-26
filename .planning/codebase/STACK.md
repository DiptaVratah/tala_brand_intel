# Technology Stack

**Analysis Date:** 2026-01-26

## Languages

**Primary:**
- JavaScript (Node.js) - Backend server, routing logic, and API endpoints
- HTML5 - Frontend UI templates
- CSS3 - Frontend styling and progressive enhancement

**Secondary:**
- JSON - Configuration, schema definitions, API contracts

## Runtime

**Environment:**
- Node.js v22.15.1 (latest LTS)

**Package Manager:**
- npm 10.9.2
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Express.js 5.1.0 - HTTP server, routing, middleware, static file serving
- Mongoose 9.0.1 - MongoDB object modeling and validation
- MongoDB Node Driver 7.0.0 - Low-level database connectivity (used by Mongoose)

**API Clients:**
- @anthropic-ai/sdk 0.71.1 - Claude Sonnet 4.5 LLM integration
- @google/generative-ai 0.24.1 - Google Gemini 2.5 Pro LLM integration
- openai 4.103.0 - GPT-4o and embeddings API integration

**Security & Middleware:**
- helmet 8.1.0 - HTTP security headers (Content Security Policy, HSTS, etc.)
- express-rate-limit 8.2.1 - Rate limiting middleware for API endpoints
- cors 2.8.5 - Cross-Origin Resource Sharing middleware

**Utilities:**
- dotenv 16.5.0 - Environment variable management
- uuid 11.1.0 - Unique identifier generation for tracking and sessions

## Key Dependencies

**Critical:**
- OpenAI SDK 4.103.0 - Primary LLM for voice analysis (voice type) and embeddings (text-embedding-3-small model)
- Anthropic SDK 0.71.1 - Secondary LLM for narrative/subtext analysis and voice alchemy (claude-sonnet-4-5-20250929)
- Google Generative AI 0.24.1 - Tertiary LLM for structured analysis and bridge generation (gemini-2.5-pro)

**Infrastructure:**
- Mongoose 9.0.1 - Data persistence for telemetry, voice kits, content logs, and vector embeddings
- MongoDB 7.0.0 - Time-series data storage for user history, identity tracking
- Express.js 5.1.0 - Core HTTP framework for all API endpoints

## Configuration

**Environment:**
- Managed via `.env` file (not committed)
- Required variables:
  - `OPENAI_API_KEY` - OpenAI API authentication
  - `ANTHROPIC_API_KEY` - Anthropic/Claude API authentication
  - `GOOGLE_API_KEY` - Google Generative AI authentication
  - `MONGO_URI` - MongoDB Atlas connection string (mongodb+srv://)
  - `PORT` - Server port (default: 3000)

**Build:**
- No build configuration detected
- No TypeScript configuration
- No linting/formatting configuration (.eslintrc, .prettierrc, biome.json not present)

## Platform Requirements

**Development:**
- Node.js v22.15.1 (or compatible v20+)
- npm 10.9.2+
- `.env` file with all required API keys and database URI
- Network access to:
  - OpenAI API (api.openai.com)
  - Anthropic API (api.anthropic.com)
  - Google Generative AI API
  - MongoDB Atlas (mongodb+srv connection)

**Production:**
- Deployment target: Render.com (mentioned in server comments)
- Environment variables required in production platform
- Port binding capability (default 3000)
- Outbound HTTPS access to all three LLM providers

## Deployment Notes

**Server Architecture:**
- Single Node.js process (express app.listen)
- No clustering or load balancing configured
- Stateless except for MongoDB persistence
- Horizontal scaling possible with shared MongoDB

**Dependencies on External Services:**
- 100% dependent on three LLM APIs (no fallback if all fail)
- 100% dependent on MongoDB Atlas for telemetry/history features
- Rate limiting in place: 10 requests per 15 min for voice analysis, 20 per 15 min for content generation

---

*Stack analysis: 2026-01-26*

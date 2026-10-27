# AI Engineer Roadmap — Context for Claude Code

## Who I am
- Sunaina — UI developer background: HTML, CSS, basic JS, basic React
- Very basic AWS knowledge; haven't used Bedrock models yet
- Goal: become an AI Engineer (specifically "AI Application Engineer" — building products on top of LLMs, not training models from scratch)
- Time available: ~5-10 hrs/week
- Currently doing a structured Next.js/Supabase/Resend training (separate from this roadmap) — assignments should be merged with AI learning, not duplicated

## Chosen path: Path B — AI Application Engineer
(As opposed to Path A: ML/DL Engineer, which is Python/math-heavy and not the right fit given my background and goals.)

Path B leverages my existing React/JS skills. Focus areas:
1. Next.js (React + backend API routes)
2. Calling LLM APIs (OpenAI/Anthropic) — prompting, streaming, system prompts
3. RAG (Retrieval-Augmented Generation) — embeddings, vector DBs (Chroma/Pinecone)
4. AWS Bedrock — since job postings for "AI Engineer" often ask for AWS/cloud experience
5. Basic AI agents — tool-calling, letting an LLM call functions/APIs

## Current training (in progress) — being merged into the roadmap
A 10-session Next.js/Supabase training building a "Mobile Shop" e-commerce app:

- **Session 1 (done):** Next.js Architecture — App Router, Server vs Client Components, routing, Suspense, loading/error boundaries, caching strategy
- **Session 2 (done):** Supabase + PostgreSQL — data modeling (categories, products, carts, orders), Row Level Security (RLS), auth architecture, project structure (services/lib pattern)
- **Session 3 (done):** Google OAuth via Supabase Auth, profile creation triggers, product catalog (PLP/PDP), Resend for transactional emails, RLS policies for profiles/products
- **Sessions 4-10 (upcoming):** Data Access Layer, full-stack integration, assessment, performance optimization, advanced Next.js patterns, security, observability, final assessment

**Key decision:** Instead of building separate toy AI projects, add AI features directly onto this same Mobile Shop app once the core (auth + product catalog) is working. This makes the training assignment double as the AI portfolio piece.

## Planned AI feature to add (once Sessions 3-4 are stable)
- AI-powered product search: parse natural language queries ("chargers under $30, fast charging") using an LLM, translate to a Supabase query/filter
- Optional: simple AI chatbot widget using the `products` table as context (basic RAG since data is already structured)
- Later: swap LLM calls to AWS Bedrock instead of calling OpenAI/Anthropic directly, to build that specific job-posting-relevant skill

## Rough timeline (adjusted for training pace)
- **Weeks 1-4ish:** Progress through training sessions (Next.js + Supabase core)
- **Once catalog + auth stable:** Get an Anthropic/OpenAI API key, make one simple LLM call from a Next.js API route (small, isolated exercise)
- **Next block:** Build the AI product search / chatbot feature into the Mobile Shop app
- **After that:** Introduce AWS Bedrock as a swap-in for the LLM calls
- **Later:** RAG deep-dive, basic agents, polish + deploy, portfolio write-up

## Mentoring style notes (for continuity)
- Prefers concrete examples over abstract concepts
- Prefers smaller, slower-paced chunks of info rather than long dense blocks
- Wants pushback/honesty if skipping foundations to chase something shiny
- Comes with specific blockers/code rather than vague "help me learn X" when possible

## Next concrete step
Once more training sessions are done (or now, if ready), design and scope the first AI feature (product search or chatbot) against the real `products` table schema from Session 2/3, and implement it inside the existing Next.js app.

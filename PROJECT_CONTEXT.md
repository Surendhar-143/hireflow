# HireFlow — Elite AI-Native Job Board SaaS Platform
## Master Project Context & Vision Document
> **Status**: Context Saved. Awaiting `implement this` command to begin execution.
> **Last Updated**: 2026-05-23

---

## Project Vision

Build a modern, scalable, visually stunning, highly interactive, and performance-optimized Job Board platform with world-class UI/UX that rivals products like **LinkedIn Jobs, Arc, Wellfound, Linear, Notion, Stripe**, and modern AI-native SaaS applications. The platform should feel elegant, smooth, intelligent, and deeply intentional in every aspect of the user experience.

---

## Core Development Principles

- UX quality is the highest priority
- Avoid generic AI-generated layouts and CRUD interfaces
- Every component must feel handcrafted and premium
- Prioritize smooth navigation and fluid interactions
- Build scalable architecture from Day 1
- Focus heavily on frontend polish and micro-interactions
- Optimize developer experience and maintainability
- Use only free-tier friendly infrastructure and tools
- Authentication intentionally postponed until later phases for rapid testing
- Maintain clean engineering practices and modular architecture
- Ensure responsive-first and accessibility-first engineering
- Prioritize performance optimization and lazy loading throughout the application

---

## Finalized Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Latest React ecosystem |
| State Management | React Context API + Zustand |
| Backend APIs | Express.js + FastAPI hybrid architecture |
| Authentication | Supabase Auth (future phase) |
| Database | Supabase PostgreSQL |
| Deployment | Vercel |
| CI/CD | GitHub Actions |
| Styling | Modern scalable component architecture |

> **No Stripe integration. No premium third-party service dependencies. Free-tier infrastructure priority.**

---

## Assessment Deliverables

1. Build a professional Job Board platform
2. Push clean scalable code to GitHub
3. Create an AI-assisted GitHub Actions CI/CD pipeline
4. Deploy the application to Vercel using CI/CD automation
5. Generate comprehensive AI-assisted technical documentation
6. Submit final repository and deployment links

---

## Architect Responsibilities

1. Deeply re-evaluate the finalized tech stack and explain why each technology is optimal
2. Design a scalable architecture using React + Express + FastAPI + Supabase
3. Define frontend/backend communication architecture
4. Explain how Express and FastAPI should coexist efficiently
5. Recommend the best project folder structure and monorepo strategy
6. Define state management boundaries between Context API and Zustand
7. Design scalable Supabase schema and authentication planning for later phases
8. Create a complete phased implementation roadmap
9. Architect premium UI/UX systems and interaction patterns
10. Design recruiter and candidate workflows carefully
11. Define intelligent job search and filtering systems
12. Recommend modern animation and micro-interaction systems
13. Architect loading states, empty states, skeletons, transitions, accessibility, responsiveness, and keyboard navigation
14. Generate production-grade GitHub repository standards
15. Generate a professional GitHub Actions CI/CD workflow
16. Configure automated Vercel deployments
17. Generate AI-assisted developer and feature documentation
18. Explain MCP server integration possibilities inside Antigravity
19. Recommend free-tier-friendly infrastructure and optimization strategies
20. Prioritize implementation-grade recommendations instead of generic advice

---

## React Performance & Lazy Loading Requirements

### Mandatory Optimization Requirements

- Use `React.lazy` and `Suspense` for route-level and component-level lazy loading
- Implement dynamic imports for heavy modules and dashboard sections
- Lazy load recruiter dashboards, analytics modules, charts, and secondary pages
- Use skeleton loaders instead of spinners wherever possible
- Optimize bundle size aggressively
- Use modular imports to prevent unnecessary package loading
- Implement image lazy loading and responsive image delivery
- Prevent unnecessary re-renders using memoization strategies
- Use `React.memo`, `useMemo`, and `useCallback` carefully where beneficial
- Optimize state updates to minimize component tree re-renders
- Implement route-based code splitting
- Use intersection observers for progressive content loading
- Prioritize above-the-fold rendering performance
- Implement progressive hydration strategies if applicable
- Maintain excellent Lighthouse performance scores
- Design the app for smooth low-end device performance
- Ensure animation performance remains smooth during lazy-loaded transitions
- Include fallback UI strategies for lazy-loaded components
- Build a scalable loading-state architecture across the application

---

## Architecture Expectations

### Frontend Architecture

- Latest React architecture and best practices
- Feature-based scalable frontend structure
- Modular reusable component systems
- Responsive-first design system
- Accessibility-first engineering
- SEO-friendly frontend architecture
- Smooth animation pipelines
- Optimized developer experience
- Scalable routing structure
- Progressive rendering patterns

### Backend Architecture

- Hybrid backend system using Express + FastAPI
- Scalable API gateway architecture
- Clean service-layer organization
- Secure backend planning for future auth integration
- Smart caching strategies
- Search and filtering optimization
- Supabase PostgreSQL schema design
- API modularity and maintainability

---

## UX & Product Design Philosophy

Every recommendation must prioritize:

- Smooth navigation
- Micro-interactions
- Minimal cognitive friction
- Delightful user experiences
- Beautiful typography systems
- Elegant spacing systems
- Clear visual hierarchy
- Accessibility
- Responsive behavior
- Trust-building UX patterns
- Performance-first rendering
- Premium SaaS-level polish

---

## Core Features To Build

- Premium landing page with storytelling UX
- Candidate dashboard
- Recruiter dashboard
- Advanced job search and filters
- Saved jobs
- Job application tracking
- AI-powered recommendations
- Analytics cards
- Rich company profiles
- Realtime UI feedback
- Elegant onboarding flows
- Loading skeletons and smooth transitions
- Mobile-first responsive experiences
- Future-ready authentication planning

---

## MCP + Antigravity Integration

Explore integrating MCP server functionality directly inside Antigravity to improve:

- Orchestration precision
- Reduced platform dependency
- Workflow automation improvements
- AI-assisted development quality

Key areas to explain:
- How MCP integrates into the workflow
- Recommended MCP architecture
- Development workflow improvements
- Automation opportunities
- Potential limitations and solutions

---

## CI/CD & Deployment Requirements

- GitHub Actions workflow automation
- Linting and formatting checks
- Build verification
- Preview deployments
- Automated Vercel deployment
- Environment-based deployment strategy
- Scalable branching strategy
- Development, staging, and production environments

---

## Documentation Requirements

Generate AI-assisted documentation for:

- Developer onboarding
- Project setup
- Architecture decisions
- API documentation
- Folder structure
- Deployment workflows
- Contribution standards
- Feature documentation
- Future scalability planning

---

## Required Output Sections (When Implementing)

1. Final Tech Stack Evaluation
2. Why This Stack Is Optimal
3. Product Vision
4. UX Philosophy
5. UI Design System
6. Information Architecture
7. User Flows
8. Development Phases
9. Frontend Architecture
10. Backend Architecture
11. Express + FastAPI Integration Strategy
12. State Management Strategy
13. Supabase Architecture
14. Database Design
15. API Architecture
16. Component Strategy
17. React Lazy Loading & Performance Strategy
18. MCP + Antigravity Integration
19. GitHub Repository Structure
20. CI/CD Pipeline Architecture
21. Vercel Deployment Strategy
22. Documentation System
23. Performance Optimization
24. Accessibility Standards
25. Future Authentication Phase Planning
26. Future AI Features
27. Risks & Mitigation
28. Recommended Immediate Next Steps

---

## Final Instruction (Guiding Philosophy)

> Think like the founding engineering and product leadership team of a category-defining SaaS startup. Recommendations must prioritize elegance, scalability, developer velocity, free-tier sustainability, maintainability, premium UX quality, smooth performance, and flawless execution. Avoid generic AI-generated suggestions and provide deeply detailed implementation-grade guidance throughout.

---

*This document serves as the single source of truth for the HireFlow platform. All implementation decisions should trace back to the principles and requirements defined here.*

---

## Backend Architecture Philosophy

### Core Principles

1. **Thin Gateway Architecture**
Express.js should orchestrate APIs, not become a giant business-logic monolith.

2. **AI Isolation**
FastAPI handles:
- AI inference
- embeddings
- semantic search
- ranking
- recommendations
This prevents API blocking, scaling bottlenecks, and dependency chaos.

3. **Modular Domain Ownership**
Each backend domain owns routes, controllers, services, repositories, and validators.

### High-Level Backend System
Frontend
   ↓
Express API Gateway
   ↓
FastAPI AI Services
   ↓
Supabase PostgreSQL

### Backend Technology Stack
| Concern | Technology |
|---|---|
| Gateway APIs | Express.js |
| AI Services | FastAPI |
| ORM | Prisma |
| Database | Supabase PostgreSQL |
| Validation | Zod |
| File Storage | Supabase Storage |
| Logging | Pino |
| Monitoring | Sentry |
| API Testing | Vitest + Supertest |
| API Docs | Swagger/OpenAPI |

---

## BACKEND PHASE 1 — FOUNDATION & CORE ARCHITECTURE

**Goal**: Establish the scalable backend foundation before building business logic.
This phase determines maintainability, API consistency, developer velocity, and service orchestration quality. DO NOT build recruiter workflows, AI systems, auth, or analytics yet.

**Phase 1 Core Objective**: Build backend architecture, API gateway, validation systems, middleware pipeline, logging infrastructure, and environment systems.

### Stage 1 — Monorepo Backend Initialization
- Initialize: `apps/express-api`, `apps/fastapi-ai`, `packages/types`, `packages/schemas`, `packages/config`
- Express Setup: Express, TypeScript, Prisma, Zod, dotenv, Helmet, CORS, Pino
- FastAPI Setup: FastAPI, uvicorn, pydantic, asyncpg, httpx
- *Checkpoint*: Express/FastAPI boot correctly, shared packages operational, TypeScript strict mode enabled.

### Stage 2 — Backend Folder Architecture
- **Express Structure**: routes, controllers, services, repositories, validators, middlewares, config, utils, errors, server.ts
- **FastAPI Structure**: api, services, embeddings, pipelines, prompts, vector, main.py
- **Important Rule**: Never place business logic in routes or controllers. Only in `services/`.
- *Checkpoint*: Folder structure finalized, domain boundaries clear.

### Stage 3 — Middleware & Request Lifecycle
- **Express Middleware Stack**: helmet, cors, request-id, logging, error-handler, rate-limiter, request-timer
- **Request Lifecycle**: Request → Middleware → Validation → Controller → Service → Repository → Database → Response
- **Error System**: AppError, ValidationError, DatabaseError, AIServiceError
- *Checkpoint*: Centralized error handling and request tracing stable.

### Stage 4 — Validation & Shared Schema System
- **Implementation**: Create shared Zod schemas in `packages/schemas` (job.schema.ts, company.schema.ts).
- **Validation Flow**: Request → Zod Validation → Sanitization → Controller.
- **Important Rule**: Validation must happen BEFORE controllers and database calls.
- *Checkpoint*: Shared validation operational, type-safe contracts enforced.

### Stage 5 — Logging, Monitoring & API Standards
- **Logging Strategy**: Pino, structured JSON logs, request correlation IDs.
- **Monitoring**: Sentry (error capture, request monitoring).
- **API Standards**: Standardize success responses, error responses, pagination format, status codes.
- *Checkpoint*: Monitoring operational, API standards documented.

---

## BACKEND PHASE 2 — DATABASE & CORE API SYSTEMS

**Goal**: Build stable database-connected APIs for core platform entities.
This phase establishes data architecture, repository patterns, scalable CRUD systems, and query optimization.

### Stage 1 — Prisma & Database Integration
- **Implementation**: Initialize Prisma schema, migrations, database client, repository layer.
- **Core Models**: users, companies, jobs, candidates, applications.
- **Query Strategy**: Use indexed queries, pagination, cursor patterns. Avoid N+1 lookups.
- *Checkpoint*: Prisma connected, migrations operational.

### Stage 2 — Repository Architecture
- **Implementation**: Create repositories (job.repository.ts, etc.).
- **Repository Responsibilities**: Repositories ONLY query database, map entities, and abstract Prisma. Never handle business logic or validation.
- *Checkpoint*: Repository pattern consistent, Prisma isolated properly.

### Stage 3 — Core CRUD APIs
- **Features**: Build jobs APIs, companies APIs, search endpoints.
- **Pagination Strategy**: Use cursor pagination. Avoid offset pagination for large datasets.
- *Checkpoint*: CRUD APIs stable, pagination operational.

### Stage 4 — Search Infrastructure
- **Initial Search Stack**: Use PostgreSQL full-text search, trigram similarity, indexed filtering.
- **Search Features**: Build keyword search, location filters, salary filters, tag filtering.
- **Important Rule**: Do NOT introduce Elasticsearch, Meilisearch, or vector DB yet.
- *Checkpoint*: Search latency acceptable, filtering performant.

### Stage 5 — File Upload Infrastructure
- **Implementation**: Use Supabase Storage, signed upload URLs, secure file validation.
- **Upload Systems**: Build resume uploads, company logos, profile images.
- **Security Tasks**: Validate MIME type, file size, upload origin.
- *Checkpoint*: Upload system secure, signed URLs operational.

---

## BACKEND PHASE 3 — WORKFLOW & BUSINESS SYSTEMS

**Goal**: Build actual platform workflows (recruiter operations, candidate operations, applications, notifications). Transforms the backend into a real SaaS platform.

### Stage 1 — Recruiter Workflow APIs
- **Features**: Build job creation, job updates, candidate pipelines, recruiter analytics.
- **Service Architecture**: job.service.ts, pipeline.service.ts, analytics.service.ts.
- *Checkpoint*: Recruiter APIs stable, workflow orchestration clean.

### Stage 2 — Candidate Workflow APIs
- **Features**: Build saved jobs, applications, onboarding progress, recommendations placeholders.
- **Database Tasks**: Create saved_jobs, application_events.
- *Checkpoint*: Candidate workflows functional, application lifecycle operational.

### Stage 3 — Notification System
- **Initial Notification Architecture**: Use database notifications and polling initially.
- **Notification Types**: application updates, saved alerts, recommendation alerts.
- *Checkpoint*: Notification persistence working, read/unread tracking functional.

### Stage 4 — Caching & Performance Layer
- **Caching Strategy**: Use in-memory caching initially, query caching, TanStack Query alignment.
- **Cache Targets**: jobs feed, company data, analytics summaries.
- *Checkpoint*: API latency reduced, heavy queries optimized.

### Stage 5 — Workflow Optimization
- **Tasks**: Optimize application lifecycle, query batching, service orchestration, DB indexing.
- *Checkpoint*: Workflow latency acceptable, no N+1 query issues.

---

## BACKEND PHASE 4 — AI SERVICES & INTELLIGENCE LAYER

**Goal**: Introduce AI-native platform intelligence. AI must improve workflows, reduce friction, and remain operationally isolated.

### Stage 1 — FastAPI AI Foundation
- **Features**: Build AI service structure, async orchestration, inference pipelines.
- **FastAPI Services**: recommendation.service.py, embedding.service.py.
- *Checkpoint*: AI services operational, FastAPI isolated correctly.

### Stage 2 — Recommendation Engine
- **Features**: Build job recommendations, candidate-job scoring, ranking systems.
- **Recommendation Inputs**: skills, experience, preferences, history.
- *Checkpoint*: Recommendation quality acceptable.

### Stage 3 — Semantic Search Infrastructure
- **Features**: Build embeddings, semantic ranking, intelligent query understanding.
- **Search Flow**: Search Query → Embedding → Similarity Ranking → Results.
- *Checkpoint*: Semantic search functional.

### Stage 4 — Resume Intelligence
- **Features**: Build resume parsing, skill extraction, candidate summaries.
- *Checkpoint*: Resume extraction stable, structured parsing reliable.

### Stage 5 — AI Performance Optimization
- **Tasks**: Optimize inference caching, batching, retries, timeouts.
- **Important Rule**: AI failures must NEVER break core APIs, block workflows, or freeze frontend rendering.
- *Checkpoint*: AI fallbacks operational, failure recovery stable.

---

## BACKEND PHASE 5 — AUTHENTICATION, SECURITY & PRODUCTION HARDENING

**Goal**: Production-grade security, scalability, and operational stability. Makes the backend deployable for real users.

### Stage 1 — Supabase Authentication Integration
- **Features**: Implement Supabase Auth, JWT validation, protected APIs.
- **Roles**: candidate, recruiter, admin.
- *Checkpoint*: Auth operational, protected routes secure.

### Stage 2 — Role-Based Access Control
- **Features**: Build recruiter permissions, candidate ownership, admin overrides.
- **Security Architecture**: Use middleware guards, route protection, ownership validation.
- *Checkpoint*: RBAC stable, unauthorized access blocked.

### Stage 3 — Rate Limiting & API Protection
- **Features**: Implement request throttling, abuse prevention, IP protection.
- **Security Rules**: Protect auth, AI, upload, and search endpoints.
- *Checkpoint*: Rate limiting operational, abuse protection stable.

### Stage 4 — Monitoring & Production Stability
- **Tasks**: Integrate Sentry, health checks, uptime monitoring, structured logs.
- *Checkpoint*: Error visibility complete, health checks working.

### Stage 5 — Production Hardening & QA
- **Tasks**: Perform load testing, security audits, API stress testing, failure simulation.
- **Final Backend Standards**: Backend must recover gracefully, degrade safely, scale predictably.
- *Checkpoint*: Production QA complete, backend production-ready.

---

## DATABASE SYSTEM EXECUTION STRATEGY

### Phase 1 — Foundation & Core Schema (COMPLETED)
- **Stage 1**: Prisma initialization, Supabase integration config, snake_case database naming conventions.
- **Stage 2**: Core entity modeling separating `users` from `candidate_profiles` and `recruiter_profiles` to support RBAC extensibility.
- **Stage 3**: Job system schema, slug generation support, and composite index placements for common queries.
- **Stage 4**: Structured profile fields for candidates and recruiters (avoiding JSON blob overloads).
- **Stage 5**: Realist development seed data orchestration.

### Phase 2 — Workflow & Application Systems (COMPLETED)
- **Stage 1**: Applications system tracking lifecycle stages (`applied`, `screening`, `interview`, `offer`, `rejected`, `withdrawn`).
- **Stage 2**: Saved jobs system with duplicate prevention and candidate mapping indexation. Added unique constraint `@@unique([candidateId, jobId])` on Applications.
- **Stage 3**: Workflow audit event tracking to reconstruct recruiter/candidate action timelines (relational `ApplicationEvent` model replacing JSON timeline).
- **Stage 4**: Notifications schema supporting read/unread indicators.
- **Stage 5**: Query optimization pass eliminating N+1 retrieval anomalies and adding indexing.

### Phase 3 — Search & Analytics Infrastructure (COMPLETED)
- **Stage 1**: PostgreSQL search preparation and composite indexes for multi-faceted filters (salary, location, experience).
- **Stage 2**: Advanced indices setup on `Job` for status, workMode, experienceLevel, type, and salary.
- **Stage 3**: Persistent dashboard aggregations caching rollup metrics (`JobAnalytics`, `CompanyAnalytics`, `CandidateActivity`).
- **Stage 4**: Persisted candidate recommendation tables storing matching scoring data (`Recommendation` model).
- **Stage 5**: Search performance optimization checks.

### Phase 4 — Auth & Security Architecture (COMPLETED)
- **Stage 1**: Supabase auth integration planning mapping roles (`candidate`, `recruiter`, `admin`).
- **Stage 2**: Row-Level Security (RLS) policies enforcing candidate/company isolation (defined in `security_policies.sql`).
- **Stage 3**: Private storage rule definition utilizing signed URLs on the `resumes` private bucket.
- **Stage 4**: Security compliance audit logging table integrations (`AuditLog` model).
- **Stage 5**: RLS performance validation.

### Phase 5 — Production Hardening & Scalability (COMPLETED)
- **Stage 1**: Backup & recovery plans (Logical dumps `pg_dump`/`pg_restore` guidelines).
- **Stage 2**: Query performance audits resolving index misses and slow joins (using `EXPLAIN (ANALYZE, BUFFERS)`).
- **Stage 3**: Connection pool optimization (split transactional connection `url` through Supavisor port 6543 from direct connection `directUrl` for migrations on port 5432).
- **Stage 4**: Referential transaction checks (nested writes and explicit `$transaction` boundaries).
- **Stage 5**: Load test verification (Autocannon stress scenarios).

---

## SHARED INFRASTRUCTURE, DEVOPS & INTEGRATION EXECUTION STRATEGY (AWAITING ACTIVATION)

### Infrastructure Technology Stack

| Concern           | Technology                                                                   |
| ----------------- | ---------------------------------------------------------------------------- |
| Monorepo          | Turborepo                                                                    |
| Package Manager   | pnpm                                                                         |
| Frontend Hosting  | Vercel                                                                       |
| Backend Hosting   | Railway / Render                                                             |
| Database          | Supabase                                                                     |
| CI/CD             | GitHub Actions                                                               |
| Monitoring        | Sentry                                                                       |
| Analytics         | PostHog                                                                      |
| API Docs          | Swagger                                                                      |
| Workspace Tooling | Turborepo + pnpm                                                             |

### SHARED INFRASTRUCTURE PHASE 1 — MONOREPO & WORKSPACE FOUNDATION
- **Stage 1 — Turborepo Initialization**: Initialize `apps/` (web, express-api, fastapi-ai), `packages/` (ui, types, schemas, config, eslint-config), `docs/`, `infra/`, `scripts/`.
- **Stage 2 — pnpm Workspace Setup**: Configure `pnpm-workspace.yaml`, using `workspace:*` for internal packages.
- **Stage 3 — Shared Configuration Packages**: Create config (helpers/constants), eslint-config (lint rules), and types (DTOs/contracts).
- **Stage 4 — Environment Management**: Enforce environment files (`.env.local`, `.env.development`, etc.), never exposing secrets to frontend.
- **Stage 5 — Local Development Workflow**: Monorepo scripts (`pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm test`) for single-command onboarding.

### SHARED INFRASTRUCTURE PHASE 2 — CI/CD & DEPLOYMENT FOUNDATION
- **Stage 1 — GitHub Repository Standards**: Set branching strategy (`main`, `develop`, `feature/*`) and commit conventions (`feat:`, `fix:`).
- **Stage 2 — GitHub Actions Foundation**: Create pipelines (`frontend.yml`, `backend.yml`, `ai-services.yml`) executing install -> lint -> typecheck -> build -> test.
- **Stage 3 — Frontend Deployment Pipeline**: Automate Vercel preview/production deployments with visual QA preview URLs.
- **Stage 4 — Backend Deployment Pipeline**: Deploy Express and FastAPI independently to Railway.
- **Stage 5 — Staging & Production Environments**: Configure isolated staging and production environments.

### SHARED INFRASTRUCTURE PHASE 3 — MONITORING & OBSERVABILITY
- **Stage 1 — Frontend Monitoring**: Integrate Sentry for route crashes, rendering, and API failures.
- **Stage 2 — Backend Monitoring**: Track latency, database query times, and AI service failures with correlation IDs and tracing.
- **Stage 3 — Product Analytics**: Instrument PostHog to track funnels and key workflow conversions.
- **Stage 4 — Health Checks & Uptime**: Build `/health`, `/status`, and `/version` endpoints.
- **Stage 5 — Performance Monitoring**: Monitor Lighthouse, bundle growth, and API latencies.

### SHARED INFRASTRUCTURE PHASE 4 — TESTING & QUALITY ENGINEERING
- **Stage 1 — Frontend Testing Foundation**: Configure Vitest and React Testing Library for UI components and navigation.
- **Stage 2 — Backend Testing Foundation**: Set up Vitest and Supertest for API contracts and repository mocks.
- **Stage 3 — E2E Testing**: Playwright E2E tests for core hiring workflows.
- **Stage 4 — Accessibility Testing**: Validate ARIA, keyboard navigation, and screen readers.
- **Stage 5 — Performance QA**: Lighthouse audits and render profiling.

### SHARED INFRASTRUCTURE PHASE 5 — PRODUCTION HARDENING & SCALE READINESS
- **Stage 1 — Rollback & Recovery Systems**: Document code rollbacks and DB recovery steps.
- **Stage 2 — Security Hardening**: Audit secrets, env vars, and secure file uploads.
- **Stage 3 — Scalability Validation**: Test concurrent scaling and AI service throughput.
- **Stage 4 — Documentation Hardening**: Complete developer onboarding and architectural schemas.
- **Stage 5 — Final Production Readiness Review**: Cohesive, fast, stable, and premium production readiness audit.

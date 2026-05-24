# HireFlow — Production Runbook

> **Last updated:** 2026-05-24  
> **Purpose:** Incident response, rollback procedures, and operational reference for on-call engineers.

---

## Table of Contents

1. [Service Map](#service-map)
2. [Health Checks](#health-checks)
3. [Rollback Procedures](#rollback-procedures)
4. [Common Incidents](#common-incidents)
5. [Database Operations](#database-operations)
6. [Monitoring & Alerts](#monitoring--alerts)

---

## Service Map

| Service | Platform | URL | Health Endpoint |
|---|---|---|---|
| Frontend (Web) | Vercel | `https://hireflow.app` | `GET /` → 200 |
| API Gateway | Railway | `https://api.hireflow.app` | `GET /health` → 200 |
| AI Microservice | Railway | `https://ai.hireflow.app` | `GET /health` → 200 |
| Database | Supabase PostgreSQL | — | Supabase dashboard |
| Storage | Supabase Storage | — | Supabase dashboard |

---

## Health Checks

### API Health Check

```bash
curl -s https://api.hireflow.app/health | jq .
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptime": "3600s",
    "db": { "status": "ok", "latencyMs": 12 },
    "cache": { "hitRate": "82.5%", "size": 142 },
    "memory": { "heapUsedMb": 128, "heapTotalMb": 256 }
  }
}
```

### Degraded Conditions

| Symptom | Likely Cause | Action |
|---|---|---|
| `db.status: "degraded"` | DB connection pool exhausted | Check Railway logs, restart service |
| `db.latencyMs > 1000` | Slow query or DB overload | Check Supabase metrics, add index |
| `cache.hitRate < 20%` | Cache cleared or restarted | Normal after restart — will recover |
| `memory.heapUsedMb > 512` | Memory leak or traffic spike | Restart service, check for loops |

---

## Rollback Procedures

### Frontend Rollback (Vercel)

**Option A — GitHub Actions (preferred):**
1. Go to GitHub → Actions → **Rollback Production**
2. Click **Run workflow**
3. Enter the target commit SHA (or leave blank for previous commit)
4. Enter a rollback reason (required for audit trail)
5. Click **Run workflow**

**Option B — Vercel Dashboard:**
1. Go to Vercel dashboard → HireFlow project → Deployments
2. Find the last known-good deployment
3. Click the `…` menu → **Promote to Production**

**Option C — CLI:**
```bash
vercel rollback --token=$VERCEL_TOKEN
```

### Backend Rollback (Railway)

**Option A — GitHub Actions (preferred):**
Use the same **Rollback Production** workflow (check "Roll back backend").

**Option B — Railway Dashboard:**
1. Go to Railway → express-api service → Deployments
2. Find the last known-good deployment
3. Click **Rollback**

**Option C — CLI:**
```bash
# Deploy a specific git SHA
git checkout <target-sha>
railway up --service=express-api --detach
```

---

## Common Incidents

### Incident: All API requests returning 503

**Symptoms:** Frontend shows error states, `/health` returns 503 or fails

**Diagnosis:**
```bash
# Check if service is running
railway logs --service=express-api --tail 100

# Check health endpoint
curl -v https://api.hireflow.app/health
```

**Resolution:**
1. If DB degraded → check Supabase status page
2. If service crashed → `railway service restart express-api`
3. If bad deploy → use Rollback procedure above

---

### Incident: Frontend blank / not loading

**Symptoms:** Vercel responds but app shows blank or crashes

**Diagnosis:**
1. Check browser console for JS errors
2. Check Vercel deployment logs
3. Verify `VITE_API_URL` env var points to correct API

**Resolution:**
1. Roll back Vercel to last good deployment
2. Check if API URL changed in deployment config

---

### Incident: AI recommendations not working

**Symptoms:** AI match panel shows fallback results only, errors in API logs

**Diagnosis:**
```bash
# Check FastAPI health
curl https://ai.hireflow.app/health

# Check Railway logs for ai service
railway logs --service=fastapi-ai --tail 50
```

**Resolution:**
- AI service has fallback logic — core workflows continue working
- Restart AI service: `railway service restart fastapi-ai`
- If cold start: wait 30s for service to warm up

---

## Database Operations

### Run a migration

```bash
cd backend/express-api
pnpm prisma migrate deploy
```

### Rollback a migration

```bash
# Check migration history
pnpm prisma migrate status

# Revert last migration (development only — use with caution in production)
pnpm prisma migrate reset --skip-seed
```

### Check slow queries

Access Supabase dashboard → Database → Query Performance to identify queries taking >500ms.

Common culprits:
- Missing index on `Job(status, createdAt)` — add via Supabase SQL editor
- N+1 patterns — identified in Prisma logs when `LOG_LEVEL=debug`

---

## Monitoring & Alerts

### Error Tracking (Sentry)

- Set `VITE_SENTRY_DSN` in Vercel env vars to enable
- Set `SENTRY_DSN` in Railway env vars for API errors

### Analytics (PostHog)

- Set `VITE_POSTHOG_KEY` in Vercel env vars to enable user behavior tracking
- Dashboard: app.posthog.com

### Log Levels (API)

Control via `LOG_LEVEL` env var in Railway:
- `info` — production default
- `debug` — for diagnosing specific issues (verbose, don't leave on)
- `error` — minimal logging for high-traffic periods

---

*This runbook is a living document. Update it after every incident resolution.*

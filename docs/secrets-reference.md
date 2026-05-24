# GitHub Repository Secrets Reference

> **IMPORTANT**: Never commit actual secret values to this file. This is a reference guide only.
> Add secrets at: `https://github.com/Surendhar-143/hireflow/settings/secrets/actions`

---

## Required Secrets

### 🌐 Vercel (Frontend Deployment)

| Secret Name | Where to find it | Required for |
|---|---|---|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens | Preview + Production deploy |
| `VERCEL_ORG_ID` | Run `vercel whoami` in `apps/web/` | Preview + Production deploy |
| `VERCEL_PROJECT_ID` | Run `vercel link` in `apps/web/` → `.vercel/project.json` | Preview + Production deploy |

**How to get Vercel IDs:**
```bash
cd apps/web
npx vercel login
npx vercel link   # Creates .vercel/project.json
cat .vercel/project.json  # Copy orgId and projectId
```

---

### 🚂 Railway (Backend API Deployment)

| Secret Name | Where to find it | Required for |
|---|---|---|
| `RAILWAY_TOKEN` | Railway Dashboard → Account → Tokens | Production API deploy |

**How to get Railway token:**
1. Go to [railway.app](https://railway.app)
2. Open **Account Settings** → **Tokens**
3. Create new token → copy value

---

### 🔧 Application Environment

| Secret Name | Value | Required for |
|---|---|---|
| `VITE_API_URL_STAGING` | `https://your-staging-api.railway.app/api` | Preview deploys |
| `VITE_API_URL_PRODUCTION` | `https://your-production-api.railway.app/api` | Production deploy |

---

### ⚡ Turborepo Remote Cache (Optional — speeds up CI by 80%+)

| Secret Name | Where to find it | Required for |
|---|---|---|
| `TURBO_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) | Remote caching |
| `TURBO_TEAM` | Your Vercel team slug (e.g. `your-org`) | Remote caching |

**How to enable Turborepo Remote Cache:**
```bash
# From your project root, run:
npx turbo login
npx turbo link
# This links the repo to Vercel's remote cache
```

---

## Environment Variables (NOT secrets — safe to put in workflow files)

| Variable | Value | File |
|---|---|---|
| `NODE_VERSION` | `20` | All workflows |
| `PNPM_VERSION` | `11` | All workflows |

---

## GitHub Environments Setup

Go to `Settings → Environments` and create:

| Environment | Protection rules |
|---|---|
| `production` | Required reviewers: `Surendhar-143`, Wait timer: 0 min |
| `production-api` | Required reviewers: `Surendhar-143` |

---

## Branch Protection Rules

Go to `Settings → Branches → Add rule` for `main`:

- [x] Require status checks before merging
  - [x] `CI / 🔍 Lint`
  - [x] `CI / 🔎 Type check`
  - [x] `CI / 🏗️ Build`
- [x] Require branches to be up to date before merging
- [x] Require pull request reviews (at least 1)
- [x] Do not allow bypassing the above settings

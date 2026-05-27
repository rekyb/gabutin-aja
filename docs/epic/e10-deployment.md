# E10 — Deployment

**Status:** [ ] Not started 
**Wave:** 5 (start after all E01–E09 complete)

---

## Goal

Package the Next.js app as a standalone Docker container and configure it for deployment to Google Cloud Run. Produce a working `Dockerfile`, `.env.example`, and verified local Docker run.

## Why

Hackathon deadline requires a single-container deploy to Cloud Run. Cloud Run auto-scales to zero between uses (zero idle cost), and a standalone Next.js build minimizes image size by excluding `node_modules` from the final image.

---

## Functional Requirements

1. `next.config.ts` must set `output: 'standalone'` — this produces `.next/standalone/` which bundles Node.js server code without `node_modules`
2. `Dockerfile` based on `node:22-alpine`, copying only: `.next/standalone/`, `.next/static/`, `public/`
3. `.dockerignore` excludes `node_modules`, `.git`, `.next/cache`, `.env*`
4. `.env.example` lists all 5 required environment variables with placeholder values (no real secrets)
5. `docker build` must succeed cleanly
6. `docker run -p 3000:3000 --env-file .env.local <image>` must start the app and serve `/` with HTTP 200
7. Container starts on port 3000 (Cloud Run default)
8. No `EXPOSE` instruction needed (Cloud Run uses `PORT` env var; `node server.js` defaults to `process.env.PORT || 3000`)

---

## Dockerfile

```dockerfile
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

---

## .dockerignore

```
node_modules
.git
.next/cache
.env
.env.local
.env.*.local
*.log
```

---

## .env.example

```
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/gabutin?retryWrites=true&w=majority

# Google Gemini API key
GEMINI_API_KEY=your_gemini_api_key_here

# Production URL (Cloud Run service URL)
NEXT_PUBLIC_APP_URL=https://gabutin-xxxxx-uc.a.run.app

# PostHog project API key (safe to expose)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key_here

# PostHog host
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## next.config.ts addition

```ts
const nextConfig = {
 output: 'standalone',
 // ... existing config (withPWA from E09 wraps this)
}
```

Note: `withPWA(...)` from E09 must wrap the config that includes `output: 'standalone'`. The final shape:

```ts
import withPWA from 'next-pwa'

export default withPWA({ dest: 'public', disable: process.env.NODE_ENV === 'development' })({
 output: 'standalone',
 // other config
})
```

---

## Build & Run Commands

```bash
# Build the Next.js app
pnpm build

# Build the Docker image
docker build -t gabutin .

# Run locally with env file
docker run -p 3000:3000 --env-file .env.local gabutin

# Verify it works
curl http://localhost:3000
```

---

## Cloud Run Manual Deploy

```bash
# Tag and push to Artifact Registry
docker tag gabutin gcr.io/YOUR_PROJECT_ID/gabutin:latest
docker push gcr.io/YOUR_PROJECT_ID/gabutin:latest

# Deploy to Cloud Run
gcloud run deploy gabutin \
 --image gcr.io/YOUR_PROJECT_ID/gabutin:latest \
 --platform managed \
 --region asia-southeast1 \
 --allow-unauthenticated \
 --port 3000 \
 --min-instances 0 \
 --max-instances 10 \
 --set-env-vars MONGODB_URI=...,GEMINI_API_KEY=...
```

Region `asia-southeast1` (Singapore) for lowest latency to Indonesian users.

---

## API Contracts

None. This epic adds only build/deploy configuration.

---

## Acceptance Criteria

- [ ] `pnpm build` completes without errors and produces `.next/standalone/`
- [ ] `docker build -t gabutin .` succeeds (exit code 0)
- [ ] `docker run -p 3000:3000 --env-file .env.local gabutin` starts and logs `"MongoDB connected"` (or equivalent)
- [ ] `curl http://localhost:3000` returns HTTP 200
- [ ] `.env.example` contains all 5 required variable names with placeholder values
- [ ] `.env.local` is not committed (`.gitignore` covers it)
- [ ] `.dockerignore` excludes `node_modules` and `.env*` files
- [ ] Container image is under 500MB (alpine base + standalone output keeps it lean)

---

## In Scope

- `next.config.ts` — add `output: 'standalone'`
- `Dockerfile`
- `.dockerignore`
- `.env.example`
- Verification: local Docker build + run

---

## Tests

No unit tests for deployment config. Pre-deploy checklist replaces tests here.

Run before marking E10 complete:
```bash
# 1. Verify CI is green on main before proceeding
gh run list --branch main --limit 3    # all recent runs must show 'completed / success'

# 2. Local pre-deploy checks
pnpm build                 # must exit 0
rtk vitest run --coverage          # all tests green, coverage ≥80%
docker build -t gabutin .          # must exit 0
docker run -p 3000:3000 --env-file .env.local gabutin &
sleep 5 && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 # must print 200
```

---

## Out of Scope / Guardrails

- No CI/CD pipeline (manual deploy for hackathon)
- No multi-stage Docker build (standalone output already handles node_modules exclusion)
- No Cloud Run YAML config file (manual gcloud command is sufficient)
- No health check endpoint beyond `/` returning 200 (Cloud Run default)
- Do not commit any real secrets to `.env.example` — placeholder strings only

---

## Dependencies

- **E01–E09** — all epics must be complete and `pnpm build` must pass before this epic starts
- **CI (E01)** — all three CI jobs (`TypeScript`, `Unit Tests`, `Coverage Gate`) must be green on `main` before deploying

---

## References

- [implementation-overview.md](../implementation-overview.md) — environment variables list
- [product-design.md §17](../product-design.md) — Deployment (Dockerfile template, env vars)
- Next.js standalone output: `output: 'standalone'` in next.config
- Cloud Run docs: `gcloud run deploy`

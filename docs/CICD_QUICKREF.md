# CI/CD Quick Reference

## Workflow Structure

```
.github/workflows/
├── ci.yml           # Validation (all branches)
└── fly-deploy.yml   # Production (main only, after CI)
```

## Timeouts

| Job            | Timeout | Why                |
| -------------- | ------- | ------------------ |
| Install/Lint   | 5min    | Fast with cache    |
| Test           | 10min   | DB + tests         |
| Build          | 10min   | Bundle app         |
| Migration test | 5min    | Run migrations     |
| Deploy         | 15min   | Image build + push |
| Smoke test     | 5min    | Health checks      |

## Commands

### Run CI locally

```bash
bun install --frozen-lockfile
bun x prettier --check .
bun x tsc --noEmit
bun run test
bun run build
```

### Deploy manually

```bash
# Trigger deploy workflow
gh workflow run fly-deploy.yml

# Check status
gh run list --workflow=fly-deploy.yml
```

### Rollback

```bash
flyctl releases list --app do-it-carpe-diem
flyctl releases rollback v42 --app do-it-carpe-diem
```

## Troubleshooting

**CI fails:**

```bash
bun install  # regenerate lockfile
git add bun.lockb && git commit
```

**Deploy fails:**

```bash
flyctl logs --app do-it-carpe-diem  # check logs
flyctl releases rollback v<prev>     # rollback
```

**Health checks fail:**

- Test `/healthz` and `/readyz` locally
- Verify `DATABASE_URL` is set

## Migration Verification

Runs all migrations against a test database to catch failures before production.

**Catches:**

- SQL syntax errors
- Missing migration dependencies
- Invalid references
- Type mismatches

## Secrets

GitHub Settings → Secrets → `FLY_API_TOKEN`

```bash
flyctl auth token  # get token
```

## Health Endpoints

- `/healthz` - Process liveness
- `/readyz` - Database connectivity

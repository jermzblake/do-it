# GitHub Actions Workflow Structure

# CI/CD Quick Reference

## Workflow Structure

.github/workflows/
├── ci.yml # Main validation (all branches)
├── fly-deploy.yml # Production deployment (main only)
├── ci.yml # Validation (all branches)
├── fly-deploy.yml # Production (main only, after CI)
└── pr-preview.yml # Preview per PR

## Quick Reference

## Timeouts

| ------------------ | ------- | --------------------- |
| Job | Timeout | Why |
| ------------ | ------- | ------------------ |
| Install/Lint | 5min | Fast with cache |
| Test | 10min | DB + tests |
| Build | 10min | Bundle app |
| Deploy | 15min | Image build + push |
| Smoke test | 5min | Health checks |

### Local Testing

### Run CI locally

# Run what CI runs

bun install --frozen-lockfile
bun x tsc --noEmit
bun test

bun run test

### Manual Deploy

### Deploy manually

# Deploy to production (bypasses CI)

gh workflow run fly-deploy.yml

# Trigger deploy workflow

# Check workflow status

gh run list --workflow=fly-deploy.yml

# Check status

# View logs

### Rollback

```bash
# List releases
flyctl releases list --app do-it-carpe-diem
# Rollback

### Preview Management

### Preview apps
# List preview apps
flyctl apps list | grep do-it-pr-

# Manually destroy preview
flyctl apps destroy do-it-pr-123 --yes
# Destroy preview


# Set DATABASE_URL for preview
flyctl secrets set DATABASE_URL="..." --app do-it-pr-123
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

## Migration Safety

Blocks destructive patterns: `DROP TABLE`, `DROP COLUMN`

**Override:** Add `# migration-safety: ignore` to migration file

**Safe pattern:**

1. Add nullable column
2. Backfill data
3. Update code
4. Drop old column (later)

## Secrets

GitHub Settings → Secrets → `FLY_API_TOKEN`

```bash
flyctl auth token  # get token
```

## Health Endpoints

- `/healthz` - Process liveness
- `/readyz` - Database connectivity

## Useful Links

- [CI Workflow](.github/workflows/ci.yml)
- [Deploy Workflow](.github/workflows/fly-deploy.yml)
- [PR Preview Workflow](.github/workflows/pr-preview.yml)
- [Full Documentation](./CICD.md)
- [Query Performance](./QUERY_PERFORMANCE.md)
- [Testing Guide](./TESTING.md)

# CI/CD Workflows Documentation

Two-workflow structure: CI validates code and Deploy pushes to production.

## Workflow Files

### 1. `ci.yml` - Continuous Integration

Runs on all pushes and PRs. Must pass before deployment.

**Jobs:**

- `prepare` (5min) - Install deps with frozen lockfile
- `lint` (5min) - Prettier formatting check
- `typecheck` (5min) - TypeScript validation
- `test` (10min) - Unit/integration tests with ephemeral Postgres
- `build` (10min) - Build app and upload artifacts
- `migration-check` (5min) - Run migrations against test database
- `ci-success` (1min) - Quality gate

---

### 2. `fly-deploy.yml` - Production Deployment

Only runs after CI passes on `main` branch.

**Jobs:**

- `check-ci` (1min) - Verify CI success
- `deploy` (15min) - Deploy to Fly.io with rolling strategy
- `smoke-test` (5min) - Test `/healthz` and `/readyz` endpoints
- `deployment-summary` (2min) - Generate deployment report

**Concurrency:** `cancel-in-progress: false` prevents canceling mid-deploy

---

## Timeout Best Practices

Every job has a timeout. GitHub's default is 360min (6 hours) - timeouts prevent runaway jobs and give fast feedback.

---

## Migration Verification

The `migration-check` job runs all migrations against a fresh test database to ensure they execute successfully. This catches:

- SQL syntax errors
- Missing dependencies between migrations
- Invalid column/table references
- Type mismatches

**If migrations fail in CI, they'll fail in production** - fix them before merging

---

## Deployment Flow

````

┌─────────────┐
│ Push to PR │
PR pushed → CI runs → PR merged → CI runs on main → Deploy runs

---

## Rollback Procedure

If deployment fails:

```bash
# View releases
flyctl releases list --app do-it-carpe-diem

# Rollback
flyctl releases rollback v<number> --app do-it-carpe-diem

# Check status
flyctl status --app do-it-carpe-diem

# View logs
flyctl logs --app do-it-carpe-diem
````

```

---

## Required Secrets
GitHub Settings → Secrets → `FLY_API_TOKEN` (get from `flyctl auth token`)

1. **Enable branch protection** - Require CI to pass before merge
2. **Add Dependabot** - Automated dependency updates
3. **Implement canary deploys** - Gradual traffic shift
4. **Add performance benchmarks** - Query regression detection
5. **Set up monitoring** - Sentry, Uptime Robot
6. **Create staging environment** - Mirror of production

---

## Additional Resources

- [Fly.io Deployment Guide](https://fly.io/docs/app-guides/continuous-deployment-with-github-actions/)
- [GitHub Actions Timeout Docs](https://docs.github.com/en/actions/learn-github-actions/usage-limits-billing-and-administration)
- [Drizzle Migrations](https://orm.drizzle.team/docs/migrations)
- [Expand/Contract Pattern](https://www.tim-wellhausen.de/papers/ExpandAndContract.pdf)
```

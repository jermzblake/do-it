# CI/CD Workflows Documentation

This project uses a modular GitHub Actions workflow structure with built-in timeouts and safety checks.

## Workflow Files

### 1. `ci.yml` - Continuous Integration

**Triggers:** Push to `main`, Pull Requests, Manual dispatch

**Purpose:** Validates all code changes before they reach production.

**Jobs:**

- **prepare** (5min timeout) - Installs dependencies with frozen lockfile
- **typecheck** (5min timeout) - Validates TypeScript types
- **test** (10min timeout) - Runs unit/integration tests with ephemeral Postgres
  Three-workflow structure: CI validates code, Deploy pushes to production, PR Preview creates test environments.
- **migration-safety** (5min timeout) - Checks for destructive database changes
- **ci-success** (1min timeout) - Quality gate that all checks must pass

**Timeout Strategy:**

Runs on all pushes and PRs. Must pass before deployment.

---

- `prepare` (5min) - Install deps with frozen lockfile
- `lint` (5min) - Prettier formatting check
- `typecheck` (5min) - TypeScript validation
- `test` (10min) - Unit/integration tests with ephemeral Postgres
- `build` (10min) - Build app and upload artifacts
- `migration-safety` (5min) - Detect destructive migrations
- `ci-success` (1min) - Quality gate
- **smoke-test** (5min timeout) - Validates deployment health
  - Liveness check: 2min timeout (10 retries × 3s)
  - Readiness check: 2min timeout (10 retries × 3s)
- **deployment-summary** (2min timeout) - Generates deployment report

Only runs after CI passes on `main` branch.

- Smoke tests: 5min (generous for slow startups)
- Each health check: 2min with retries
- `check-ci` (1min) - Verify CI success
- `deploy` (15min) - Deploy to Fly.io with rolling strategy
- `smoke-test` (5min) - Test `/healthz` and `/readyz` endpoints
- `deployment-summary` (2min) - Generate deployment report
  **Triggers:** PR opened/updated/closed
  **Concurrency:** `cancel-in-progress: false` prevents canceling mid-deploy
  **Purpose:** Creates isolated preview environments for each PR.
- **deploy-preview** (15min timeout) - Creates/updates Fly app per PR
  - App creation: 3min timeout
  - Deploy: 10min timeout

### 3. `pr-preview.yml` - Preview Environments

Creates isolated Fly.io app per PR. Destroyed when PR closes.

- Deploy: 15min (same as production)
- `deploy-preview` (15min) - Create app, deploy, smoke test, comment PR
- `cleanup-preview` (5min) - Destroy app on PR close

---

**Note:** Preview apps need `DATABASE_URL` configured manually or use shared staging DB. 3. **Queue management** - Free up runners for other workflows 4. **Incident detection** - Timeouts signal infrastructure issues

### Timeout Guidelines

Every job has a timeout. GitHub's default is 360min (6 hours) - timeouts prevent runaway jobs and give fast feedback.

- `DROP TABLE`
- `DROP COLUMN`
- `ALTER TABLE ... DROP`

Detects destructive patterns: `DROP TABLE`, `DROP COLUMN`, `ALTER TABLE ... DROP`

```sql
**Override:** Add `# migration-safety: ignore` comment to migration file.

**Expand/Contract pattern for safe schema changes:**
3. **Switch**: Update code to use new column
4. **Contract**: Drop old column (in later release)

---

## Deployment Flow

```

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
```

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

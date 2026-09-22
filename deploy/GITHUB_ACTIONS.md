# GitHub Actions deployment

Two workflows build and ship the whole platform on every push to `main`
(and on manual `workflow_dispatch`):

| Repo | Workflow file | Builds | Deploys to (server) |
|------|---------------|--------|---------------------|
| `fitcloud-frontend` | `.github/workflows/deploy-frontend.yml` | `apps/{central,admin,member}` static exports | `domains/fitfarmhq.com/public_html/{. , member, admin}` |
| `fitcloud-api` | `deploy-api.yml` | PHP app incl. `vendor/` | `domains/api.fitfarmhq.com/` |

Both use **rsync over SSH** — no Docker, no Node runtime on the shared host.

## Secrets to create

GitHub → repo → **Settings → Secrets and variables → Actions → New repository secret**.

### `fitcloud-frontend` repo

| Secret | Example | Notes |
|--------|---------|-------|
| `SSH_HOST` | `u123456789.hostinger.com` | SSH host from hPanel |
| `SSH_USER` | `u123456789` | |
| `SSH_PRIVATE_KEY` | `-----BEGIN OPENSSH PRIVATE KEY----- ...` | the `fitcloud_deploy` key from `HOSTINGER.md` |
| `SSH_TARGET_ROOT` | `domains/fitfarmhq.com/public_html` | relative to server home |
| `NEXT_PUBLIC_API_URL` | `https://api.fitfarmhq.com/api/v1` | used by all three apps |
| `NEXT_PUBLIC_PLATFORM_DOMAIN` | `fitfarmhq.com` | member app subdomain slug resolution |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_test_...` | member portal checkout (test mode now) |
| `NEXT_PUBLIC_ADMIN_APP_URL` | `https://admin.fitfarmhq.com` | central redirects owners here |
| `NEXT_PUBLIC_MEMBER_APP_URL` | `https://fitfarmhq.com` | central fallback link (member is per-slug on the wildcard) |

### `fitcloud-api` repo

| Secret | Example | Notes |
|--------|---------|-------|
| `SSH_HOST` | same as above | |
| `SSH_USER` | same | |
| `SSH_PRIVATE_KEY` | same | |
| `API_SSH_TARGET_ROOT` | `domains/api.fitfarmhq.com` | relative to server home |
| `APP_KEY` | `base64:...` | from `php artisan key:generate` |
| `DB_HOST` | `127.0.0.1` | Hostinger MySQL usually localhost |
| `DB_PORT` | `3306` | |
| `DB_DATABASE` | `fitcloud` | hPanel DB name |
| `DB_USERNAME` / `DB_PASSWORD` | your DB user | |
| `PAYSTACK_SECRET_KEY` | `sk_test_...` | test mode currently |
| `PAYSTACK_VERIFY_REFERENCES` | `true` | turn on once live / once verified flow is tested |
| `PLATFORM_DOMAIN` | `fitfarmhq.com` | per-gym subdomain URL generation |
| `CORS_ALLOWED_ORIGINS` | `https://fitfarmhq.com,https://admin.fitfarmhq.com` | exact origins; wildcard subdomains matched via `config/cors.php` patterns |
| `MAIL_*` | SMTP/Resend keys once email is configured | see below |

## What the workflows do

**`deploy-frontend.yml`** — one job per app (`central`, `admin`, `member`):

```
checkout → setup-node 22 → npm ci (in apps/<app>) → next build (static export → out/)
→ rsync -az --delete out/ → ${SSH_TARGET_ROOT}/{central,''|member}
```

**`deploy-api.yml`**:

```
checkout → setup-php 8.3 + composer → composer install --no-dev --optimize-autoloader
→ write .env from secrets → rsync app (vendor included; excludes .git, node_modules, storage/app, logs, database.sqlite)
→ ssh: php artisan migrate --force, storage:link, optimize
```

> **First deploy only**: run `php artisan db:seed --force` by hand so the default tenant,
> super-admin, permissions and demo license exist. The workflow does **not** seed automatically
> (to avoid duplicate rows on later deploys).

## Development contract

- Deploy = push/merge to `main`. Prefer PRs; staging = a second target (e.g. `staging.fitfarmhq.com`)
  can be added later by adding a second workflow/scoped env, out of scope now.
- Env lives in secrets, never in code. The apps read `NEXT_PUBLIC_*` at **build time** (static
  export bakes values in) — changing a public key/URL requires a redeploy, not a var change.
- The API `.env` is regenerated on every deploy from secrets (single source of truth).
- Failed builds notify you via the repo's Actions tab; add Slack/email notifications later if wanted.

## Email (before launch)

App currently uses `MAIL_MAILER=log`. Before going live with owner notifications / member email:
choose a provider (Resend, Mailgun, Brevo, or Hostinger MX/SMTP) and set `MAIL_*` secrets,
then redeploy once. Update `MAIL_FROM_ADDRESS` to `no-reply@fitfarmhq.com`.
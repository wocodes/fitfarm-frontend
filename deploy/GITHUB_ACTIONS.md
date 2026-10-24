# GitHub Actions deployment

Two workflows build and ship the whole platform on pushes to the deployment branch (`main` for the frontend; the API workflow accepts `main` or `master`)
(and on manual `workflow_dispatch`):

| Repo | Workflow file | Builds | Deploys to (server) |
|------|---------------|--------|---------------------|
| `fitcloud-frontend` | `.github/workflows/deploy-frontend.yml` | `apps/{central,admin,member}` static exports | `domains/fitfarmhq.com/public_html/{. , member, admin}` |
| `fitcloud-api` | `.github/workflows/deploy-api.yml` | PHP app incl. `vendor/` | `domains/api.fitfarmhq.com/` |

Both use **rsync over SSH** — no Docker, no Node runtime on the shared host.

## Secrets to create

GitHub → repo → **Settings → Secrets and variables → Actions → New repository secret**.

### `fitcloud-frontend` repo

| Secret | Example | Notes |
|--------|---------|-------|
| `SSH_HOST` | `89.116.133.7` or the host from hPanel | SSH host; use the IP if the hostname does not resolve |
| `SSH_PORT` | `65002` | Hostinger shared SSH port (port 22 is closed) |
| `SSH_USER` | `u300464533` | |
| `SSH_PRIVATE_KEY` | `-----BEGIN OPENSSH PRIVATE KEY----- ...` | the `fitfarm_deploy` key from `HOSTINGER.md` |
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
| `SSH_PORT` | `65002` | Hostinger shared SSH port |
| `SSH_USER` | same | |
| `SSH_PRIVATE_KEY` | same | |
| `API_SSH_TARGET_ROOT` | `domains/fitfarmhq.com/public_html/api` | confirmed Hostinger path |
| `PHP_BIN` | `/opt/alt/php83/usr/bin/php` | CLI PHP 8.3; the default `php` on this account is 8.2 |
| `APP_KEY` | `base64:...` | from `php artisan key:generate` |
| `DB_HOST` | `127.0.0.1` | Hostinger MySQL usually localhost |
| `DB_PORT` | `3306` | |
| `DB_DATABASE` | `fitcloud` | hPanel DB name |
| `DB_USERNAME` / `DB_PASSWORD` | your DB user | |
| `PAYSTACK_SECRET_KEY` | `sk_test_...` | test mode currently |
| `PAYSTACK_VERIFY_REFERENCES` | `true` | must be `true` in production; the API rejects unverified purchases |
| `PLATFORM_DOMAIN` | `fitfarmhq.com` | per-gym subdomain URL generation |
| `CORS_ALLOWED_ORIGINS` | `https://fitfarmhq.com,https://admin.fitfarmhq.com` | exact origins, including any customer domains |
| `CORS_ALLOWED_ORIGIN_PATTERNS` | *(optional)* | comma-separated regexes for many custom domains |
| `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` | your private values | only used when you run `php artisan db:seed` once |
| `MAIL_*` | SMTP/Resend keys once email is configured | see below |

## Cloudflare member Worker secrets

Add to the frontend repository:

| Secret | Notes |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Workers Scripts: Edit, Workers Routes: Edit, Zone: Read |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

The wildcard Worker route must be accompanied by no-script bypass routes for
`admin.fitfarmhq.com/*`, `api.fitfarmhq.com/*`, and `www.fitfarmhq.com/*`.
See `CLOUDFLARE.md`.

## What the workflows do

**`deploy-frontend.yml`** — one job per Hostinger app (`central`, `admin`):

```
checkout → setup-node 22 → npm ci (in apps/<app>) → next build (static export → out/)
→ rsync -az --delete out/ → ${SSH_TARGET_ROOT}/<central|admin|member>
  (the Central deploy excludes admin/ and member/)
```

**`deploy-member.yml`** — builds `apps/member` and deploys it to the
`fitfarm-member` Cloudflare Worker with route `*.fitfarmhq.com/*`.

**`deploy-api.yml`**:

```
tests (PHPUnit) → setup-php 8.3 + composer → composer install --no-dev
→ validate required secrets → write .env from secrets
→ maintenance mode → rsync app (excludes .git, dev tooling, storage, logs, database.sqlite)
→ ssh: migrate --force, storage:link, optimize, up → health-check /up
```

> **First deploy only**: after the code is deployed, set `SUPER_ADMIN_EMAIL` and
> `SUPER_ADMIN_PASSWORD` in the server `.env` (or as GitHub secrets before the deploy) and run
> `php artisan db:seed --force` once. The seeder creates the platform administrator only when
> those values are set and never creates demo users in production. Do not run the old seed file;
> it contained known credentials.

## Development contract

- Deploy = push/merge to `main`. Prefer PRs; a staging target (e.g. `staging.fitfarmhq.com`)
  should be added before the first real gym is onboarded.
- The Central frontend deploys into the same document root as `admin/` and `member/`; the
  workflow excludes those directories so a Central deploy cannot delete the other two apps.
- Env lives in secrets, never in code. The apps read `NEXT_PUBLIC_*` at **build time** (static
  export bakes values in) — changing a public key/URL requires a redeploy, not a var change.
- The API `.env` is regenerated on every deploy from secrets (single source of truth).
- Failed builds notify you via the repo's Actions tab; add Slack/email notifications later if wanted.

## Email (before launch)

App currently uses `MAIL_MAILER=log`. Before going live with owner notifications / member email:
choose a provider (Resend, Mailgun, Brevo, or Hostinger MX/SMTP) and set `MAIL_*` secrets,
then redeploy once. Update `MAIL_FROM_ADDRESS` to `no-reply@fitfarmhq.com`.
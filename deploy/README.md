# FitCloud Platform Deployment

Production target: **Hostinger Business (shared) web hosting** for the `fitfarmhq.com` domain.
Deployment method: **GitHub Actions** (build on CI, rsync over SSH to Hostinger).

All three frontends are 100% client-rendered. We ship them as **static exports**
Next.js (`output: 'export'`) so shared hosting never has to run a Node process.
The Laravel API runs as a normal PHP app with its document root set to `public/`.

## URL map

| App | Host | What it serves |
|-----|------|----------------|
| Central (platform) | `fitfarmhq.com` (+ `www`) | SaaS landing page, gym-owner signup/login, setup wizard, (future) owner dashboard |
| Admin (gym back-office) | `admin.fitfarmhq.com` | Static export of `apps/admin`. Tenant set via `?tenant=` / owner login redirect |
| Member portal | `{slug}.fitfarmhq.com` (wildcard) | Static export of `apps/member`. Tenant set via `?tenant=` **or** derived from the subdomain (e.g. `polanfit.fitfarmhq.com` → `polanfit`) |
| Custom gym domain | `gym.com` etc. | Alternate Host for the same member static app (see `HOSTINGER.md` "custom domain" SOP) |
| API | `api.fitfarmhq.com` | Laravel 13 API, PHP 8.3, document root = `public/` |

## Repositories

- `fitcloud-frontend` — monorepo: `apps/central`, `apps/admin`, `apps/member` + this `deploy/` folder.
- `fitcloud-api` — Laravel API (`/api/v1`), Oracle-free, MySQL in production.

## Services / artifacts produced by CI

| Source repo | Workflow | Artifact → server location |
|-------------|----------|----------------------------|
| `fitcloud-frontend` | `.github/workflows/deploy-frontend.yml` | `apps/{central,admin,member}` static exports → `domains/fitfarmhq.com/public_html/...` (see workflows) |
| `fitcloud-api` | `.github/workflows/deploy-api.yml` | Full Laravel tree incl. `vendor/` → `domains/fitfarmhq.com/public_html/api/` |

## Architecture notes (production-specific)

- **CORS**: `config/cors.php` is pinned to the production + local origins (bearer-token auth, no cookies).
- **DB**: MySQL via hPanel. SQLite remains the local dev DB.
- **Queues/Jobs**: none used yet; all work is synchronous. Revisit if heavy mail/backup jobs are added (needs cron `schedule:run` via hPanel Cron Jobs, or a VPS).
- **Secrets**: never committed. CI injects them from GitHub encrypted secrets and writes `.env` on the server. `SUPER_ADMIN_*` is used only for the one-time bootstrap seed.
- **Storage**: uploaded CMS images go to `storage/app/public`; the API serves them under `/storage`. A `storage:link` symlink is created on the server.

## Quick sequence on first launch

1. Follow `CLOUDFLARE.md` (DNS + wildcard TLS).
2. Follow `HOSTINGER.md` (subdomains, SSH, MySQL, PHP 8.3).
3. Create GitHub secrets (`GITHUB_ACTIONS.md`) on both repos.
4. Push to `main` on each repo → workflows build and deploy.
5. On API repo, migrations run automatically. Seed once only with `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` set; never use the legacy demo seed in production.
6. Open `fitfarmhq.com/setup`, provision the first gym, validate the returned `polanfit-arena...` style URLs.

See `GITHUB_ACTIONS.md` for the full secret list and workflow behavior.
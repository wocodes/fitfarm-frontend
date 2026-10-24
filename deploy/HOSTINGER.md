# Hostinger hPanel setup (Business shared hosting)

Scope: prep the **Business/Premium shared hosting** account to serve the FitCloud platform.
Two long-lived workstreams run on this box: the **Laravel API** (PHP app) and the **three static
Next.js exports** (plain files, no Node runtime needed).

> All paths below are relative to your account home (`/home/<user>/`). Confirm the exact layout
> in **File Manager** the first time — paths vary slightly by account/region.

## 1. Enable SSH (required for GitHub Actions deploys)

- hPanel → **Advanced → SSH Access** → enable.
- Copy the **SSH connection details** (host = `your-user.hostinger.com` or the server FQDN,
  port 22, username). You will add/change a password or key here.
- Verify from your Mac:

  ```sh
  ssh -p 65002 <user>@<host>
  ```

  Once you confirm login, generate a dedicated **deploy key** (used by CI only):

  ```sh
  ssh-keygen -t ed25519 -f ~/.ssh/fitfarm_deploy -C "fitfarm-ci" -N ""
  # Add ~/.ssh/fitfarm_deploy.pub in hPanel → SSH Access, or:
  ssh-copy-id -p 65002 -i ~/.ssh/fitfarm_deploy.pub <user>@<host>
  ```

  Keep the **private** key (`~/.ssh/fitcloud_deploy`) — it becomes the
  `SSH_PRIVATE_KEY` GitHub secret (use the private key only, never the `.pub` file). Never commit it.

## 2. DNS entries at Hostinger (only if NOT moving to Cloudflare)

Recommended path is Cloudflare (see `CLOUDFLARE.md`). If you keep DNS at Hostinger for now:
hPanel → **Domains → fitfarmhq.com → DNS Zone** and add:

| Type | Name | Content |
|------|------|---------|
| A | `@` | server IP |
| A | `www` | server IP |
| A | `*` | server IP |
| A | `api` | server IP |
| A | `admin` | server IP |

Then order/verify SSL for each (Hostinger free certs are per-domain; a **wildcard** can't be
issued here, which is the main reason to use Cloudflare instead).

## 3. Subdomains & document roots (hPanel → Websites → Domains)

Create these and note the path each resolves to (File Manager will show it):

| Subdomain | Intended doc root (under your home) | Content |
|-----------|--------------------------------------|---------|
| `api.fitfarmhq.com` | `domains/fitfarmhq.com/public_html/api` | Laravel app; `.htaccess` rewrites to `public/` |
| `admin.fitfarmhq.com` | `domains/fitfarmhq.com/public_html/admin` | static export of `apps/admin` |
| `*.fitfarmhq.com` | none | served by the `fitfarm-member` Cloudflare Worker; see `CLOUDFLARE.md` |
| `fitfarmhq.com` | `domains/fitfarmhq.com/public_html` | static export of `apps/central` |

- The `*.fitfarmhq.com` hostnames are served by Cloudflare Workers, not a Hostinger document
  root. The old `public_html/member` folder can remain as a fallback but is not used.
- PHP version: hPanel → **PHP Configuration (per subdomain)** → set **8.3** for `api.fitfarmhq.com`.
- Set the API subdomain's **document root to `public/`** via hPanel → the subdomain's
  **Websites → Document Root / "Public directory"** setting (or via an `.htaccess` rewrite —
  see note below).

### `.htaccess` fallback (if hPanel can't set docroot to `public/`)

Drop this at the API app root's `.htaccess` (for example `domains/api.fitfarmhq.com/.htaccess`):

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

## 4. MySQL database

- hPanel → **Databases → MySQL** → **Add new database**: name e.g. `fitcloud`.
- Create / bind a **database user** with full privileges on `fitcloud`.
- Note `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, and host — these become GitHub secrets
  for the API workflow.

## 5. Free SSL (origin certificates)

- hPanel → **Websites → the subdomain → SSL** → issue the free Let's Encrypt/Sectigo cert for
  `fitfarmhq.com`, `api.fitfarmhq.com`, `admin.fitfarmhq.com`.
- The literal wildcard `*.fitfarmhq.com` cannot get free origin certs here. Cloudflare's edge
  certificate alone is not enough: the origin must also present a certificate for the requested
  hostname. Install a Cloudflare Origin CA wildcard certificate on the account/domain (or use a
  Cloudflare Tunnel). Without it, tenant subdomains fail with Cloudflare **525**.

## 6. First deploy attestation (what CI expects)

1. `.github/workflows` rsync directly to `domains/fitfarmhq.com/public_html/...` (frontend) and
   `domains/fitfarmhq.com/public_html/api/` (API) over SSH. That is the confirmed path on
   this account; the `api` directory already contains the rewrite to `public/`.
2. After the API lands, the workflow runs migrations and caches. Run the one-time seed manually:

   ```sh
   cd domains/fitfarmhq.com/public_html/api
   /opt/alt/php83/usr/bin/php artisan migrate --force
   # Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD first, then:
   /opt/alt/php83/usr/bin/php artisan db:seed --force   # first time only
   ```

## 7. Custom gym domain SOP (repeatable onboarding)

Every time a gym wants `gym.com` to point at their member portal:

1. hPanel → **Websites → Add Domain (or parked/domain alias)** → add `gym.com`, and set its
   **document root** to the same member folder used by `*.fitfarmhq.com`.
2. Issue the free SSL for `gym.com` in hPanel.
3. Tell the gym to point DNS at the account: `A  @  <HOSTINGER_SERVER_IP>` (and optionally
   `A  www  <HOSTINGER_SERVER_IP>`).
4. Have the gym's first visit include the tenant: `https://gym.com/?tenant=<slug>` — or better,
   from the central console we send them a one-time link with `?tenant=` pre-filled. After the
   first visit the member app remembers the tenant in `localStorage` for that origin.

> If the gym uses Cloudflare, they can instead do `CNAME @ → <slug>.fitfarmhq.com` (their edge
> handles TLS), and step 1–2 above can be skipped.

## 8. Cron / scheduling

- hPanel → **Advanced → Cron Jobs**: add once scheduled tasks exist in Laravel:

  ```sh
  cd domains/api.fitfarmhq.com && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
  ```

  Today there are **no scheduled tasks** in the API — skip until one is added.

## 9. Backups

- Hostinger shared hosting includes automatic daily backups (hPanel → **Backups**).
- The Laravel app also ships a **Backup controller** (`/admin/backups`, `/backups/create`) that
  snapshots DB tables to `storage/app/backups`.
- Add hPanel **Cron → mysqldump** to the API home weekly if you want DB-only off-site dumps:
  `mysqldump -u <user> -p'<pass>' fitcloud > domains/api.fitfarmhq.com/storage/app/backups/fitcloud-$(date +%F).sql`

## Common gotchas

- **LiteSpeed caching** may cache the API. Keep `api` DNS-only at Cloudflare and disable any
  "LiteSpeed Cache" plugin on the API subdomain (it's not WordPress, so N/A — but don't enable
  static caching for the API directory).
- **Permissions**: after rsync, ensure `storage/` and `bootstrap/cache/` are writable by PHP:
  `chmod -R 775 storage bootstrap/cache`.
- **`.env`**: never upload your own; the CI workflow generates it from secrets.
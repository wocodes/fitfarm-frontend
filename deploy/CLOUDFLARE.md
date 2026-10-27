# Cloudflare setup for fitfarmhq.com

Why Cloudflare: one free plan gives you a **wildcard TLS certificate for `*.fitfarmhq.com`**
(out of the box on Hostinger shared hosting we'd otherwise need a paid Wildcard SSL),
plus CDN/caching, a WAF, and one place to manage all tenant subdomains and redirects.

## 1. Add the site to Cloudflare

1. Sign up / sign in at https://dash.cloudflare.com.
2. **Add site** → enter `fitfarmhq.com` → choose the **Free** plan → Continue.
3. Cloudflare scans existing DNS records. There are none that matter (domain is parked); delete any it auto-imports that you don't want.
4. Keep the **two Cloudflare nameservers** it shows you (e.g. `abc.ns.cloudflare.com`, `xyz.ns.cloudflare.com`).
5. Go to your Hostinger **hPanel → Domains → fitfarmhq.com → Nameservers** and replace Hostinger's with the two Cloudflare nameservers.
6. Back in Cloudflare, **Finish**. DNS propagation is typically minutes to a couple of hours.

## 2. DNS records (the exact table)

Create these under **DNS → Records** in Cloudflare (zone `fitfarmhq.com`):

| Type | Name | Content (target) | Proxy status |
|------|------|------------------|--------------|
| A | `fitfarmhq.com` | `<HOSTINGER_SERVER_IP>` | Proxied (orange cloud) |
| A | `www` | `<HOSTINGER_SERVER_IP>` | Proxied (orange cloud) |
| A | `*` | `<HOSTINGER_SERVER_IP>` | Proxied (orange cloud) |
| A | `api` | `<HOSTINGER_SERVER_IP>` | **DNS only** (grey cloud) |
| A | `admin` | `<HOSTINGER_SERVER_IP>` | Proxied (orange cloud) |

Notes:
- `<HOSTINGER_SERVER_IP>` = the IPv4 address of your hosting account (find it in Hostinger
  hPanel → Hosting → the plan → under "Details"/"IP address", or the Welcome email).
- The **wildcard `*`** drives the per-gym member portals (`polanfit.fitfarmhq.com`, ...).
  Specific records (`api`, `admin`) take precedence over the wildcard — that's how the API
  and admin console land on the right app.
- `api` is intentionally **DNS only** (not proxied): keeps Laravel seeing the real client IP
  (rate-limiting/logs/webhooks) and avoids Cloudflare caching JSON responses. If you later
  want WAF on the API too, flip it to proxied and adjust SSL mode.
- Don't add `git`, `smtp` etc. records unless you set up those services.

## 3. SSL/TLS settings

1. **SSL/TLS → Edge Certificates → SSL mode: Full** (origin has Hostinger's own free
   certificates; "Full" encrypts the whole path without needing Cloudflare to trust a
   custom origin cert).
2. Confirm **Always Use HTTPS** is ON, and optionally enable **Automatic HTTPS Rewrites**.
3. The free **Universal SSL** covers `fitfarmhq.com` **and** `*.fitfarmhq.com` at the edge.
   It does **not** install a certificate on the Hostinger origin. If a tenant subdomain returns
   **525 SSL handshake failed**, install a Cloudflare Origin CA certificate for
   `*.fitfarmhq.com` (or use a Cloudflare Tunnel) before relying on the wildcard. A proxied
   wildcard without an origin certificate will keep failing with 525.

## 4. Recommended extras (free plan)

- **Caching → Configuration**: keep "Standard" caching. Optionally add a **Cache Rule**
  excluding `/api/*` on `api.fitfarmhq.com` (only relevant if `api` is ever proxied; with
  DNS-only it already bypasses the cache).
- **Network → Always Use HTTPS + HTTP/2 or HTTP/3**: enable.
- **Rules → Redirect Rules** (as tenants use branded admin URLs later, or to force `www`).
- **Security Level**: Medium; enable **Bot Fight Mode** if desired (trial).

## Troubleshooting

- **"Too many redirects"**: SSL mode should be **Full**, not "Flexible".
- **Wildcard subdomain not resolving**: confirm the `*` A record is present and the wildcard
  subdomain `*.fitfarmhq.com` was also created in Hostinger hPanel (origin must accept the host).
- **API webhooks**: keep `api` DNS-only; the payment provider sends webhooks to
  `https://api.fitfarmhq.com/api/v1/webhooks/bachs` from their servers — no CF IP allowlist needed
  when DNS-only.

## 5. Member portal on Cloudflare Workers

The member app is a static Next.js export and is served by a Worker instead of the Hostinger wildcard.

### Create bypass routes first

The wildcard route would otherwise catch `admin` and `api` too. Create these routes **without a Worker script** so they continue to Hostinger:

```bash
ZONE_ID="<fitfarmhq.com zone id>"
CF_TOKEN="<cloudflare api token>"

for pattern in \
  "admin.fitfarmhq.com/*" \
  "api.fitfarmhq.com/*" \
  "www.fitfarmhq.com/*"
do
  curl -s -X POST \
    "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/workers/routes" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"pattern\":\"$pattern\"}"
done
```

No `script` field means those routes bypass the wildcard Worker. Cloudflare matches the most specific route first.

The same command is available as:

```bash
cd fitcloud-frontend/deploy
CLOUDFLARE_API_TOKEN="..." CLOUDFLARE_ZONE_ID="..." ./setup-cloudflare-routes.sh
```

### GitHub secrets

Add these to the frontend repository:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

The token needs:

```text
Account → Workers Scripts → Edit
Zone    → Workers Routes   → Edit
Zone    → Zone             → Read
```

### Deployment

The member Worker config is `apps/member/wrangler.jsonc`. The workflow is
`.github/workflows/deploy-member.yml`.

Deploy manually once with:

```bash
cd fitcloud-frontend/apps/member
npm run build
CLOUDFLARE_API_TOKEN="..." CLOUDFLARE_ACCOUNT_ID="..." npx wrangler@4 deploy
```

The Worker pattern is:

```text
*.fitfarmhq.com/*
```

Verify:

```bash
curl -I https://polanfit.fitfarmhq.com
curl -I https://admin.fitfarmhq.com
curl -I https://api.fitfarmhq.com/up
```

Custom domains are not covered by this wildcard. They need a Worker route in the
customer’s Cloudflare zone or Cloudflare for SaaS custom hostnames.

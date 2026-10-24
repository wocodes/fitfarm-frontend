#!/usr/bin/env bash
set -euo pipefail

: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN}"
: "${CLOUDFLARE_ZONE_ID:?Set CLOUDFLARE_ZONE_ID to the fitfarmhq.com zone ID}"

api="https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/workers/routes"

for pattern in \
  "admin.fitfarmhq.com/*" \
  "api.fitfarmhq.com/*" \
  "www.fitfarmhq.com/*"
do
  echo "Creating no-script bypass route: ${pattern}"
  curl -sS -X POST "$api" \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data "{\"pattern\":\"${pattern}\"}"
  echo
done

echo
echo "Routes:"
curl -sS "$api" -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"
echo

# Click Tracking (Cloudflare Worker + Analytics Engine)

This project now includes a dedicated redirect tracker Worker that:
1. logs each click to Analytics Engine dataset `CLICKS`
2. returns a `302` redirect to the existing Skool CTA URL

## Worker Files
- `worker/click-tracker.js`
- `wrangler.click-tracker.toml`

## Source Links
Use these links in each channel:
- YouTube video: `https://go.smartindie.dev/youtube`
- Email: `https://go.smartindie.dev/s/email`
- Website: `https://go.smartindie.dev/s/website`
- YouTube profile: `https://go.smartindie.dev/bio`

All website CTA links in this repo now point to the website source link above.

## Deploy
From repo root:

```bash
npx wrangler whoami
npx wrangler deploy --config wrangler.click-tracker.toml
```

Wrangler config includes:
- custom domain: `go.smartindie.dev`
- analytics binding: `CLICKS` -> dataset `CLICKS`
- target URL: the existing Skool CTA URL

## Query Clicks Per Source
Run against Analytics Engine SQL API (replace `<ACCOUNT_ID>` and `<TOKEN>`):

```bash
curl -sS -X POST "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/analytics_engine/sql" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: text/plain" \
  --data-binary "SELECT blob1 AS source, SUM(double1) AS clicks FROM CLICKS GROUP BY source ORDER BY clicks DESC"
```

Daily trend by source:

```sql
SELECT DATE_TRUNC('day', timestamp) AS day, blob1 AS source, SUM(double1) AS clicks
FROM CLICKS
GROUP BY day, source
ORDER BY day DESC, clicks DESC;
```

## Schema Used
`CLICKS.writeDataPoint()` fields:
- `blob1`: source (`youtube-video`, `email`, `website`, `youtube-profile`)
- `blob2`: redirect target URL
- `blob3`: request path
- `blob4`: request host
- `blob5`: country
- `blob6`: colo
- `blob7`: referrer host
- `blob8`: user agent (trimmed)
- `double1`: click count (`1`)
- `index1`: `cf-ray` request id

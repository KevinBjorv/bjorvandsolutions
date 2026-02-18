# Cloudflare Turnstile + MailerLite Deployment

These steps wire the static GitHub Pages site to a Cloudflare Worker that validates Turnstile invisibly and subscribes users to MailerLite.

## 1) Prepare the Worker project
1. Install Wrangler (if needed): `npm install -g wrangler`.
2. From the repo root, create or reuse a Worker project:
   ```bash
   wrangler init smartindie-subscribe --no-deploy
   ```
3. Point the Worker entry to the provided code:
   - Replace the generated entry file with `worker/subscribe.js`, or set in `wrangler.toml`:
     ```toml
     name = "smartindie-subscribe"
     main = "worker/subscribe.js"
     compatibility_date = "2024-12-01"
     ```

## 2) Rotate and add secrets
Run these once per environment (uses the new Turnstile secret; retire any older secrets):
```bash
echo "<TURNSTILE_SECRET>" | wrangler secret put TURNSTILE_SECRET
echo "<MAILERLITE_API_KEY>" | wrangler secret put MAILERLITE_API_KEY
# Optional: target a MailerLite group
# echo "<GROUP_ID>" | wrangler secret put GROUP_ID
```

## 3) Deploy the Worker and route /api/subscribe
Deploy with the route that your GitHub Pages domain uses (example shown for smartindie.dev):
```bash
wrangler deploy --name smartindie-subscribe worker/subscribe.js --routes "https://smartindie.dev/api/subscribe"
```
This binds the Worker to `https://smartindie.dev/api/subscribe` while keeping the rest of the site static.

## 4) Add WAF or rate limiting
In the Cloudflare dashboard (Security → WAF):
1. Create a rate limiting rule for path `/api/subscribe*` (e.g., block or challenge after 10 requests per 5 minutes per IP).
2. Alternatively, add a WAF rule that challenges high-risk traffic to that path. The Worker also performs a per-IP cache-based rate limit (10 requests per 5 minutes).

## 5) Testing checklist
- Load `/email-updates/` and submit an email. Confirm the button reads “Get the template.”
- Ensure the form only submits after Turnstile runs (no request when JavaScript is disabled).
- Verify failed Turnstile responses return HTTP 400 and show the on-page error.
- Trigger more than 10 submissions from one IP within 5 minutes to confirm HTTP 429 from the Worker.
- Confirm a successful submission returns HTTP 200 and that the email appears in MailerLite under Subscribers (and in the specified Group if `GROUP_ID` is set).

---

# Cloudflare Click Tracking Redirect Worker

This Worker tracks click sources in Analytics Engine and redirects to the Skool CTA URL.

## Files
- `worker/click-tracker.js`
- `wrangler.click-tracker.toml`
- `CLICK_TRACKING.md`

## Deploy
```bash
npx wrangler whoami
npx wrangler deploy --config wrangler.click-tracker.toml
```

## Tracked Source URLs
- `https://go.smartindie.dev/s/youtube-video`
- `https://go.smartindie.dev/s/email`
- `https://go.smartindie.dev/s/website`
- `https://go.smartindie.dev/s/youtube-profile`

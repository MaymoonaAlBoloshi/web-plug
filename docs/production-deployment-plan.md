# WebPlug production deployment plan

## Target architecture

WebPlug will use three public surfaces:

| Surface | Hosting | Proposed URL | Responsibility |
| --- | --- | --- | --- |
| Backend/platform | Docker host | `https://webplug.maymoona.dev` | APIs, authentication, data, crawling, PDFs, LLM calls, widget scripts |
| Customer dashboard | Netlify | `https://dashboard.maymoona.dev` | Admin and customer interfaces |
| Northstar demo | Netlify | Netlify URL or `https://demo.maymoona.dev` | Public test website containing both embeds |

The backend must be deployed before either Netlify frontend can be tested end to end.

## Important current-state note

The repository currently contains a full-stack Next.js application. Dashboard pages, authentication, route handlers, the JSON data store, and the embed scripts all run in the same service.

The Docker deployment is ready now. The standalone `demo/` site is also ready for Netlify. The dashboard is not yet a standalone static frontend: separating it for Netlify requires the frontend/backend work described below.

## Phase 1: prepare the backend server

### Server requirements

- Linux host capable of running Docker and Docker Compose
- Public ports `80` and `443`
- Persistent storage for `/app/.data`
- At least 1 GB memory for a demonstration; increase for concurrent PDF processing and crawling
- DNS access for `maymoona.dev`
- Reverse proxy such as Caddy, Traefik, or Nginx

### DNS

Create an `A` record:

```text
webplug.maymoona.dev -> SERVER_PUBLIC_IPV4
```

Add an `AAAA` record only if the server has working public IPv6.

### Server files

Clone the private repository:

```bash
git clone https://github.com/MaymoonaAlBoloshi/web-plug.git
cd web-plug
cp .env.docker.example .env.docker
```

Generate the encryption secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Configure `.env.docker`:

```env
WEBPLUG_PORT=3000
NEXT_PUBLIC_APP_URL=https://webplug.maymoona.dev
AUTH_SECRET=REPLACE_WITH_THE_GENERATED_SECRET

LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=openai/gpt-oss-20b
LLM_API_KEY=OPTIONAL_PLATFORM_GROQ_KEY
```

Do not commit `.env.docker`. Changing `AUTH_SECRET` later invalidates login sessions and prevents previously encrypted customer API keys from being decrypted.

### Start the container

```bash
docker compose --env-file .env.docker up --build -d
docker compose --env-file .env.docker ps
curl http://127.0.0.1:3000/api/health
```

Expected health response:

```json
{"status":"ok","service":"webplug"}
```

The Compose service mounts the named volume `webplug-data` at `/app/.data`. This contains the JSON database and uploaded PDFs.

### Reverse proxy and TLS

Do not expose port `3000` directly to the internet. Terminate HTTPS at a reverse proxy and forward traffic to `127.0.0.1:3000`.

Example Caddy configuration:

```caddyfile
webplug.maymoona.dev {
    encode zstd gzip
    reverse_proxy 127.0.0.1:3000
}
```

After TLS is active, verify:

```bash
curl https://webplug.maymoona.dev/api/health
curl -I https://webplug.maymoona.dev/widget.js
curl -I https://webplug.maymoona.dev/accessibility.js
```

## Phase 2: split the dashboard frontend from the backend

This work is required before the dashboard can be hosted independently on Netlify.

### Backend changes

1. Add JSON authentication endpoints for login, logout, session refresh, and current-user lookup.
2. Convert dashboard Server Actions into authenticated JSON endpoints.
3. Ensure every customer endpoint derives `tenantId` from the authenticated server session.
4. Add an explicit origin allowlist containing the production dashboard URL and local development URL.
5. Support credentialed requests and CSRF protection for state-changing operations.
6. Apply request-size limits, rate limits, and structured error responses.
7. Keep model keys, PDF parsing, crawling, retrieval, and LLM calls exclusively on the backend.

### Recommended browser/auth arrangement

Use the custom dashboard domain `dashboard.maymoona.dev`. This keeps the dashboard and API under the same registrable domain.

Alternatively, configure Netlify proxy rewrites so browser requests to `/api/*` are forwarded to `https://webplug.maymoona.dev/api/*`. This avoids exposing backend routing details in dashboard code and simplifies cookie handling.

Never expose Groq or customer model keys in `NEXT_PUBLIC_*` variables or frontend bundles.

### Dashboard frontend changes

1. Move dashboard screens into a standalone frontend package, such as `dashboard/`.
2. Replace direct calls to `readDb()` with API queries.
3. Replace server redirects and server-session reads with an API-backed session bootstrap.
4. Implement loading, authentication-expired, offline, empty, and API error states.
5. Configure the API origin through a build environment variable.
6. Preserve admin/customer role boundaries in both navigation and backend authorization.

Proposed variable:

```env
NEXT_PUBLIC_WEBPLUG_API_ORIGIN=https://webplug.maymoona.dev
```

Frontend checks are not security boundaries. The backend must independently authorize every request.

## Phase 3: deploy the dashboard to Netlify

After the split is implemented:

1. In Netlify, import `MaymoonaAlBoloshi/web-plug`.
2. Select the future `dashboard/` package as the base/package directory.
3. Use the package's build command and publish directory.
4. Add `NEXT_PUBLIC_WEBPLUG_API_ORIGIN=https://webplug.maymoona.dev`.
5. Assign the custom domain `dashboard.maymoona.dev`.
6. Add the final Netlify origin to the backend allowlist.
7. Test login, logout, tenant separation, PDF upload/removal, configuration, scans, support requests, and admin-only controls.

Until Phase 2 is finished, the operational dashboard remains available from the Docker platform at:

```text
https://webplug.maymoona.dev/dashboard
https://webplug.maymoona.dev/admin
```

## Phase 4: deploy the Northstar demo to Netlify

The standalone demo is already located in `demo/`.

1. In Netlify, import `MaymoonaAlBoloshi/web-plug` as a second site.
2. Set **Base directory** to `demo`.
3. The committed `demo/netlify.toml` runs `npm run build` and publishes `dist`.
4. Add this build environment variable:

```env
WEBPLUG_ORIGIN=https://webplug.maymoona.dev
```

5. Deploy the site.
6. Optionally assign `demo.maymoona.dev`.

The generated demo loads:

```text
https://webplug.maymoona.dev/widget.js
https://webplug.maymoona.dev/accessibility.js
```

The backend must have the `northstar` tenant enabled for both products.

## Phase 5: configure scanning

After the Netlify demo has a public URL:

1. Sign in to the WebPlug admin dashboard.
2. Open the Northstar customer.
3. Replace `https://example.com` with the final Netlify demo URL.
4. Run **Scan**.
5. Confirm the website source count and test grounded answers.

Do not scan while `example.com` remains configured because a successful scan replaces the tenant's previous website-type sources. Uploaded PDFs remain separate.

For complete bilingual scanning, publish crawlable English and Arabic paths such as `/en` and `/ar`. A browser-only language switch exposes only the server-rendered default language to the current crawler.

## Security work required before real customer data

- Remove the displayed demo credentials from the login page.
- Replace hard-coded seed passwords with environment-provided initial credentials.
- Add password reset and password change flows.
- Add CSRF protection and a strict dashboard-origin allowlist.
- Add an external shared rate limiter.
- Add upload malware scanning and stricter PDF validation.
- Add audit records for admin configuration changes without recording private chats.
- Restrict customer PDF citations according to the intended document visibility policy.
- Back up `/app/.data` automatically.
- Pin container image versions and add dependency/container vulnerability scanning.

Do not store production customer content on the pilot JSON store longer than necessary.

## Production data migration

Before horizontal scaling or multiple containers:

1. Move users, tenants, configurations, sources, and support requests to PostgreSQL.
2. Move PDF binaries to S3-compatible object storage.
3. Move crawl and PDF-processing jobs to a queue-backed worker.
4. Move rate limiting to Redis or another shared store.
5. Run database migrations as an explicit deployment step.
6. Keep all tenant queries scoped and covered by isolation tests.

## Deployment order checklist

- [ ] Provision the Docker server.
- [ ] Point `webplug.maymoona.dev` DNS to the server.
- [ ] Configure `.env.docker` and preserve `AUTH_SECRET`.
- [ ] Start Docker Compose with persistent storage.
- [ ] Configure the HTTPS reverse proxy.
- [ ] Verify backend health and public embed scripts.
- [ ] Configure and test Groq.
- [ ] Deploy the standalone Northstar demo to Netlify.
- [ ] Update Northstar's website URL and run a scan.
- [ ] Complete the dashboard/API separation.
- [ ] Deploy the standalone dashboard to Netlify.
- [ ] Apply custom dashboard and demo domains.
- [ ] Complete the security checklist before using real customer data.
- [ ] Add automated volume backups and uptime monitoring.

## Rollback and backup

Before each platform update:

```bash
docker compose --env-file .env.docker ps
docker run --rm -v web-plug_webplug-data:/data -v "$PWD":/backup alpine tar czf /backup/webplug-data-backup.tgz -C /data .
```

Keep `.env.docker` and the volume backup outside the Git repository. To roll back application code, check out the previous known-good commit and rebuild the container while retaining the same volume and `AUTH_SECRET`.

# Deployment guide

WebPlug is split into two deployable surfaces:

- The full platform is a stateful Next.js Node service packaged as a Docker image.
- `demo/` is a standalone static Northstar website intended for Netlify. It loads the chatbot and accessibility scripts from the public platform origin.

## Run the platform with Docker

Copy the environment template and replace the placeholder secret:

```powershell
Copy-Item .env.docker.example .env.docker
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Set `AUTH_SECRET` in `.env.docker` to the generated value. Optionally configure the platform-wide model fallback there.

Build and start the service:

```powershell
docker compose --env-file .env.docker up --build -d
docker compose --env-file .env.docker ps
```

The platform is available at `http://localhost:3000`. Its health endpoint is `/api/health`.

The named volume `webplug-data` is mounted at `/app/.data`, preserving the JSON database and PDF uploads when the container is replaced. Back up this volume before upgrading or moving hosts.

To use another host port:

```powershell
$env:WEBPLUG_PORT = "3020"
docker compose --env-file .env.docker up -d
```

## Host the platform publicly

Deploy the Dockerfile to any host that supports a long-running container and persistent volumes. Configure:

```text
AUTH_SECRET=<long-random-secret>
NEXT_PUBLIC_APP_URL=https://platform.example.com
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=openai/gpt-oss-20b
LLM_API_KEY=<optional-platform-fallback-key>
```

Mount persistent storage at `/app/.data`, expose container port `3000`, and use `/api/health` as the health check. Run one application instance while the pilot uses its file-backed store.

## Deploy the Northstar demo to Netlify

The demo is intentionally static and contains no secret. The WebPlug platform must already be available at a public HTTPS origin.

1. In Netlify, choose **Add new project → Import an existing project**.
2. Connect the private `MaymoonaAlBoloshi/web-plug` GitHub repository.
3. Set **Base directory** to `demo`.
4. Netlify reads `demo/netlify.toml`, which runs `npm run build` and publishes `demo/dist`.
5. Add this build environment variable:

```text
WEBPLUG_ORIGIN=https://platform.example.com
```

6. Deploy the site.

The build validates the origin, injects it into the static page, and loads:

```html
<script src="https://platform.example.com/widget.js" data-bot="northstar"></script>
<script src="https://platform.example.com/accessibility.js" data-site="northstar"></script>
```

The scripts are created dynamically by `demo/src/app.js`; the examples above show the resulting connection.

## Local demo build

```powershell
$env:WEBPLUG_ORIGIN = "http://localhost:3000"
npm run build --prefix demo
```

The deployable files are written to `demo/dist` and intentionally excluded from Git.

## Production note

The Docker volume is appropriate for a single-instance pilot and demonstrations. Before horizontal scaling, replace the JSON store with a transactional database, move PDFs to object storage, and replace the in-process rate limiter with a shared service.

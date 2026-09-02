# WebPlug

WebPlug is a multi-customer platform for embedding private, source-grounded chatbots into customer websites. Each chatbot uses only the configured website and uploaded PDFs, links visitors back to its sources, and offers a support form when the knowledge base cannot answer.

## Included in this release

- Customer and administrator authentication with signed, HTTP-only sessions
- Tenant-isolated customer workspaces and server APIs
- Chatbot branding, live preview, and installation snippet
- PDF upload, text extraction, processing status, serving, and removal
- Admin-controlled website URLs, safe same-origin crawling, and rescans
- Grounded lexical retrieval with an optional OpenAI-compatible model adapter
- Clickable website and PDF citations
- Ephemeral chat messages that are never written to the data store
- Support requests containing only the visitor email and submitted query
- Admin provisioning, product access controls, scan activity, and provider status
- Responsive customer dashboard and embeddable widget
- English and Arabic chatbot UI, RTL layout, localized support flow, and Unicode-aware retrieval
- Independently enabled accessibility toolkit with nine customer-selectable visitor controls

## Local setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The standalone embedded-widget test site is available at `http://localhost:3000/demo-site`.

The development store is created automatically in `.data/database.json`. Demo credentials are shown on the sign-in page:

- Customer: `owner@northstar.local` / `demo123`
- Administrator: `admin@webplug.local` / `admin123`

Change or remove the seeded users before a public deployment.

## Model configuration

Without model environment variables, the app runs in local retrieval mode and returns concise source excerpts. To use a cloud or internally hosted OpenAI-compatible chat-completions endpoint, configure:

```env
LLM_BASE_URL=https://provider.example/v1
LLM_API_KEY=your-key
LLM_MODEL=your-model
```

Set a long, random `AUTH_SECRET` in every deployed environment. Set `NEXT_PUBLIC_APP_URL` to the public platform origin so installation snippets use the correct URL.

Administrators can also configure a different provider for each customer from **Admin → Customers → Configure**. Customer keys are encrypted with `AUTH_SECRET`, never returned to the dashboard, and override the platform-wide environment variables for that customer.

## Embed

The customer overview provides the generated snippet. Its shape is:

```html
<script src="https://your-webplug-host/widget.js" data-bot="customer-slug" defer></script>
```

Set `data-language="ar"` to open the widget in Arabic. Hosts with their own language switch can send `{ type: "webplug:set-language", language: "ar" }` to the widget iframe; the included demo site shows this integration. Arabic questions also switch the widget and answer language automatically.

The loader creates an isolated iframe, responds to the configured left/right position, and resizes between launcher and open-chat states.

The accessibility product uses a separate host-page script because its controls intentionally adjust the surrounding website:

```html
<script src="https://your-webplug-host/accessibility.js" data-site="customer-slug" defer></script>
```

Its interface is isolated in Shadow DOM. Visitor preferences are stored locally in their browser, not in WebPlug, and can be reset from the menu.

## Validation

```bash
npm test
npm run lint
npm run build
npm audit --omit=dev
```

## Deployment note

The initial implementation deliberately uses a filesystem-backed JSON store and local PDF directory to remain self-contained. This is suitable for a single persistent Node server and pilot installations. Before horizontal scaling or serverless deployment, replace `src/lib/store.ts` with a transactional database adapter and move PDF binaries to object storage. The tenant IDs and service boundaries are already explicit to make that migration straightforward.

See [the product plan](docs/project-plan.md) and [implementation architecture](docs/architecture.md) for details.

## Deployment

- Build and run the full platform with `docker compose --env-file .env.docker up --build -d`.
- Mount `/app/.data` persistently on a public container host.
- Deploy the independent `demo/` directory to Netlify with `WEBPLUG_ORIGIN` pointing to that public platform.

See the [deployment guide](docs/deployment.md) for the complete Docker and Netlify setup.

The agreed production topology and server handoff checklist are documented in [the production deployment plan](docs/production-deployment-plan.md).

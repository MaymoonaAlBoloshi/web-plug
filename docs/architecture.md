# Implementation architecture

## Runtime boundaries

WebPlug has three surfaces served by one Next.js application:

1. `/dashboard` is the authenticated customer workspace.
2. `/admin` is the authenticated internal control plane.
3. `/widget.js` and `/embed/[slug]` form the public embedded chatbot.
4. `/accessibility.js` is the independently entitled accessibility toolkit that runs on the host page.

All customer mutations derive the tenant ID from the signed server session. Public chatbot routes resolve the tenant from an enabled installation slug and never accept a tenant ID from the visitor.

## Data model

The first release stores four collections:

- `users`: identity, role, password hash, and optional tenant membership
- `tenants`: installation slug, website URL, enabled state, and chatbot configuration
- `sources`: tenant-owned website pages and parsed PDFs
- `supportRequests`: tenant-owned email/query pairs and workflow state

Chats are intentionally absent from the persistent model. The browser sends only a small window of the current session when it needs follow-up context; neither the chat endpoint nor provider adapter writes it to disk.

## Accessibility embed

Accessibility access is enabled separately from chatbot access. Customers choose which visitor tools are available and configure the launcher position, icon, colors, and bilingual title. The public loader fetches only this non-sensitive configuration, renders its panel inside an isolated Shadow DOM, and applies selected adjustments to the host document. Preferences remain in visitor-local storage and never enter the platform database.

## Knowledge ingestion

PDF uploads are size- and content-type-limited, stored under a random source ID, parsed to normalized text, and assigned a processing status. Website scans validate public HTTP(S) destinations, reject private-network addresses, remain on the configured origin, bound page count and response size, and replace the tenant's previous web-page snapshot only after the scan finishes.

## Answer path

1. Resolve an enabled tenant from the public installation slug.
2. Select only ready sources owned by that tenant.
3. Chunk and rank source text against the visitor query.
4. Reject the question when the relevance threshold is not met.
5. Optionally ask an OpenAI-compatible provider to answer solely from retrieved evidence.
6. Return the answer and deduplicated clickable citations.
7. If unsupported or unavailable, offer the support form.

Retrieval tokenization supports Latin and Arabic Unicode text. The widget localizes its controls, switches to RTL layout, and instructs configured models to answer in the same language as the visitor's question.

The provider instruction treats retrieved documents as untrusted evidence and tells the model never to follow instructions inside them.

## Production evolution

For a multi-instance deployment:

- Replace the file store with PostgreSQL or another transactional database.
- Store PDFs in tenant-scoped object storage.
- Move crawling and PDF extraction to a background job queue.
- Replace the in-process rate limiter with a shared store such as Redis.
- Add password-reset or organization SSO according to customer requirements.
- Add structured document embeddings behind the existing retrieval boundary when scale requires them.

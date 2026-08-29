# Embeddable Chatbot Platform

## Product summary

This project is a reusable, multi-customer chatbot platform for websites built and managed by our team. Instead of creating a separate chatbot system for every customer, we configure and deploy one shared platform while keeping each customer's branding, content, knowledge, and support requests isolated.

The first release focuses exclusively on the chatbot. An embeddable accessibility toolkit is planned as a later product.

## Product surfaces

### Embedded chatbot

The chatbot is installed on a customer's website and used by its visitors.

It will:

- Match the customer's logo, colors, name, and welcome content.
- Answer only questions related to that customer's website and uploaded PDFs.
- Use content collected from the configured website URL and its relevant internal pages.
- Include clickable links to supporting website pages or PDF sources.
- Refuse unsupported and unrelated questions instead of inventing an answer.
- Preserve context temporarily during an active chat so follow-up questions work.
- Discard the private conversation when the visitor's session ends.
- Offer a support form when it cannot answer a question.

The support form collects:

- The visitor's email address.
- The unanswered query, carried over from the chatbot and shown to the visitor.

Only the submitted support request is stored. The surrounding conversation is not retained.

### Customer dashboard

Customers can:

- Change the chatbot logo, colors, name, and welcome text.
- Upload, replace, and remove PDFs from the knowledge base.
- See whether documents are processing, ready, or failed.
- Preview their configured chatbot.
- View support-form submissions.
- Mark or remove handled support requests.

Customers cannot:

- Activate products or subscriptions.
- Change the website URL configured by our team.
- Access visitor chat transcripts.
- Configure infrastructure or model connections.
- View another customer's data.

Email notifications and built-in email replies are not required in the first release. Customers will check support requests in the dashboard and contact visitors externally when needed.

### Internal administration

Our team can:

- Create customer accounts.
- Configure each customer's website URL.
- Activate or deactivate chatbot access.
- Start website scans and rescans.
- Review crawling and document-processing status.
- Configure the model connection when the provider strategy is decided.
- Suspend or remove a customer installation.

Product access is manually managed. Customers tell our team which products they want, and our team enables them.

## Knowledge and answer behavior

Each customer has an isolated knowledge base containing:

- Content scanned from their configured website URL and relevant internal pages.
- PDFs uploaded through their dashboard.

When a visitor asks a question, the system searches only that customer's knowledge. Answers must be grounded in the retrieved material and include clickable sources. If the available sources do not support an answer, the chatbot must say that the information is unavailable and offer the support form.

The AI backend must remain provider-agnostic. It may eventually use:

- An API key owned by our team.
- A customer-provided API key.
- A customer-hosted internal language model.

The exact provider and connection setup are intentionally deferred.

## Primary system flow

1. Our team creates a customer account.
2. Our team enters the customer's website URL and enables chatbot access.
3. The system scans relevant internal website pages.
4. The customer uploads PDFs and customizes the chatbot.
5. Website pages and PDFs are processed into an isolated knowledge base.
6. Our team embeds the chatbot on the customer's website.
7. A visitor asks a question.
8. The system searches only that customer's knowledge.
9. The chatbot answers with clickable supporting sources.
10. If no supported answer exists, the chatbot offers the support form.
11. The submitted email address and unanswered query appear in the customer dashboard.
12. The rest of the visitor's conversation disappears after the session.

## Application pages and states

### Customer-facing pages

- Sign in
- Dashboard overview
- Chatbot appearance
- Knowledge base
- Chatbot preview
- Support requests
- Account settings

### Internal pages

- Customer list
- Create and edit customer
- Website scan management
- Processing status
- Product-access controls
- Model and provider configuration (later)

### Embedded chatbot states

- Closed launcher
- Welcome view
- Active conversation
- Loading and response-generation state
- Answers with source links
- Unsupported-question state
- Support form
- Submission success state
- Error and retry states

## Privacy and isolation requirements

- Visitor conversations are private and ephemeral.
- Customer users cannot review chat transcripts.
- Conversation content is discarded after the visitor session.
- Support requests store only the visitor's email and unanswered query.
- Every website, PDF, chatbot configuration, and support request belongs to exactly one customer.
- No customer can retrieve or influence another customer's data or chatbot.
- Any future analytics should avoid storing message content unless the privacy requirements are explicitly changed.

## Implementation phases

1. Build authentication, customer separation, and internal account setup.
2. Build chatbot branding controls and the customer dashboard.
3. Add PDF upload, processing, and deletion.
4. Add website crawling and rescanning.
5. Add knowledge retrieval and model-independent answer generation.
6. Build the embeddable chatbot and clickable source presentation.
7. Add ephemeral chat handling and strict scope enforcement.
8. Add support-form submission and dashboard management.
9. Test customer isolation, prompt-injection resistance, mobile behavior, privacy, and embed compatibility.
10. Deploy a pilot installation on one real customer website.

## Deferred scope

- Accessibility toolkit
- Automated subscriptions and billing
- Self-service product activation
- Stored conversation histories
- Conversation analytics
- Email notifications and built-in email replies
- Final AI-provider and internally hosted model strategy


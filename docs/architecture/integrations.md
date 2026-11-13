# External Integrations (Planned)

## Payment
Candidate gateway: Razorpay for India-centric launch, Stripe where supported, or another approved provider. Select based on business entity, markets, fees and compliance. Use hosted checkout, verified signed webhooks, idempotency and entitlement reconciliation. Do not store card numbers.

## OpenAI
Optional future functionality: invitation copy suggestions, wording translation and layout recommendations. Must be opt-in where user data is transmitted, with moderation, cost caps, privacy notices and fallback to manual editing. AI is not required for MVP.

## Storage
S3-compatible private object storage for original photos, processed images, template artwork and exports. Use signed uploads/downloads, antivirus/content checks as appropriate, image resizing, retention limits and lifecycle policies. CDN only for public/approved assets.

## Email
Transactional provider for verification, password reset, receipts and optional RSVP notifications. Use verified sending domain, templates, bounce handling, unsubscribe controls where legally required and background delivery.

## Maps & Sharing
Optional venue link to external maps; WhatsApp share via URL intent (not unauthorized message automation); QR code generation for public invitation links.

## Integration Lifecycle
Sandbox → credentials in secrets manager → webhook verification → staging tests → production approval → monitoring and rollback.

## Current Status
No external service connected; vendors and costs must be approved.

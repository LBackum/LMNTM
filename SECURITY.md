# Security policy

## Reporting a vulnerability

Email **ask@drkayjay.com** with the subject `SECURITY` and a description of
the issue. We respond within 5 business days and will coordinate disclosure.
Please do not file a public GitHub issue.

## Threat model & controls

### Authentication & sessions
- Passwordless magic-link sign-in via Supabase Auth.
- Sessions stored in HttpOnly, Secure cookies; rotated on sign-in.
- Server reads the session on every request via `@supabase/ssr`; never trust
  a client-provided user id.

### Data access
- **Row Level Security** is `enable`d on every application table. All
  read policies check `auth.uid() = user_id`.
- The `service_role` key is only used from the Stripe webhook handler and
  other trusted server routes — never bundled into client code.

### Payments
- Stripe Checkout is the only path to purchase. No card data touches our
  servers or database.
- Webhook events are verified via `stripe.webhooks.constructEvent` with the
  shared signing secret.
- Webhook idempotency is enforced by a unique `stripe_events.id` row —
  retried deliveries cannot double-grant entitlements.
- Prices are re-calculated server-side from `web/src/lib/stripe.ts`; the
  client cannot spoof a lower amount.

### Age / consent
- Before any paid chapter renders, the user's age-verification record is
  checked. Minors cannot access paid content until `consent_granted_at` is
  set via the parent's emailed token.

### Transport & headers
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.
- Strict Content Security Policy, `X-Frame-Options: DENY`, no MIME sniffing,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy` blocks camera/mic/geolocation/FLoC.

### Supply chain
- `npm audit --omit=dev --audit-level=high` runs in CI.
- CodeQL scans JS/TS on every push and PR.
- Gitleaks scans for committed secrets.
- Dependabot opens weekly PRs for dependency updates.

### Secrets
- `.env*` files are gitignored. `.env.example` ships with placeholders only.
- The Stripe publishable key is the only credential present in client
  bundles (this is safe by design).
- The Stripe secret key, Supabase service-role key, and Resend key are
  server-only env vars stored in Vercel's encrypted environment.

## Known limitations to address before launch

- **Rate limiting.** API routes should be fronted by a rate limiter. See
  `web/src/lib/rate-limit.ts` TODO.
- **Abuse monitoring.** Hook Stripe Radar + add per-account purchase caps.
- **PDF signed URLs.** The `/ebook` PDF link currently returns a static
  path; swap it for a Supabase Storage signed URL keyed to entitlements.
- **Mobile deep links.** Verify Universal Links / App Links for iOS and
  Android before store submission.

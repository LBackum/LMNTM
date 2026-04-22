# LMNTM — Lessons Mama Never Taught Me

Companion web and mobile app for *Lessons Mama Never Taught Me* by
**Dr. Karen R. January**. Readers can purchase individual chapters for
**$2.99** or unlock the full book for **$20**, then read in-app on the
web or scroll through the whole book on the dedicated full-book page.

Front matter (cover, copyright, foreword, acknowledgements, introduction,
prologue, table of contents, epilogue, and About the Author) is free.

## Project layout

```
LMNTM-app/
├── web/                  Next.js 15 (App Router) — the primary reader + commerce
├── mobile/               Expo (iOS / Android / Web) — reader-only shell
├── supabase/migrations/  Database schema (auth, entitlements, age verification, audit)
├── scripts/              extract_book.py — docx → JSON section pipeline
├── .github/              CI, CodeQL, Dependabot, gitleaks
├── SECURITY.md           Threat model, reporting, known limitations
└── README.md
```

## Quick start — web

```bash
cd web
cp ../.env.example .env.local       # then fill in real values
npm install
npm run dev                         # http://localhost:3000
```

### Required env vars

See `.env.example`. You need accounts with:

1. **Supabase** — free tier works. Create a project, copy the URL, anon key,
   and service-role key. Apply the schema from
   `supabase/migrations/20260422000000_init.sql` in the SQL editor.
2. **Stripe** — start in **test mode**. Copy `pk_test_…`, `sk_test_…`. Create
   a webhook endpoint pointing at `https://YOUR-DOMAIN/api/stripe/webhook`
   listening for `checkout.session.completed`, copy the signing secret.
3. **Resend** (optional) — for parental-consent email delivery. Without a key
   the app logs the email body to stdout in dev.

### Regenerate book content

```bash
cd web
npm run content:extract             # parses the .docx and writes JSON
```

## Mobile (Expo)

```bash
cd mobile
npm install
npm run ios                         # or: npm run android / npm run web
```

The mobile app wraps the web reader in a WebView. Purchases happen on
lmntm.app (web); the App Store & Google Play both permit this *reader-app*
pattern for digital content. Native in-app purchase is **not** wired up by
design — adding it requires Apple IAP / Google Play Billing, not Stripe.

## Content model

The `.docx` is parsed once at build time into JSON sections by
`scripts/extract_book.py`. Each section has:

| field            | notes                                       |
|------------------|---------------------------------------------|
| `id`             | slug (e.g. `chapter-1`, `foreword`)         |
| `isChapter`      | true for the 13 paid chapters               |
| `chapterNumber`  | 1–13 for chapters, null otherwise           |
| `free`           | front/back matter is free, chapters paid    |
| `preview`        | first ~45 words (paywall teaser)            |
| `body`           | full section text                           |

The manifest is `web/src/content/manifest.json`; per-section JSON files live
in `web/src/content/sections/`.

## Languages & translation

UI strings are localized in `web/src/i18n/dictionary.ts`. Shipped locales:
English, Spanish, French, Portuguese, Haitian Creole, Swahili, Simplified
Chinese, Arabic (RTL handled automatically). Users can switch languages
from the top bar.

For per-chapter translation of the book body itself, the `/api/translate`
endpoint calls DeepL or Google Cloud Translation (set `TRANSLATION_PROVIDER`
and `TRANSLATION_API_KEY`) and caches results per `(section_id, locale)` in
Supabase. Machine translation is a launch-day stopgap — we recommend
replacing it with human-reviewed translations for officially supported
languages.

## Accessibility

- Targets **WCAG 2.2 Level AA**.
- Built-in reading preferences panel: font scale (90–140%), high contrast,
  dyslexia-friendly font, reduced motion.
- Respects `prefers-reduced-motion` and `prefers-contrast` system settings.
- Skip-to-content link, focus-visible rings, ARIA labels on nav / forms.
- All interactive elements keyboard-reachable.
- Public accessibility statement at `/legal/accessibility`.

## Security highlights

- Supabase Row Level Security on every table.
- Stripe webhook signature verification + idempotency log.
- Prices re-derived server-side from a single source of truth.
- Strict CSP, HSTS, no MIME sniffing, `X-Frame-Options: DENY`.
- CI runs `npm audit`, CodeQL, and gitleaks on every push.
- See [SECURITY.md](./SECURITY.md) for the full threat model.

## Deployment

- **Web** → Vercel. Add the env vars, point the `lmntm.app` domain at the
  project, and Vercel's edge network handles the rest.
- **Database** → Supabase. Run the migration SQL once; enable RLS (the
  migration does this for you).
- **Stripe** → switch from test keys to live keys only after end-to-end
  verification. Update the webhook endpoint URL to production.
- **Mobile** → `eas build` for iOS and Android binaries; submit through
  Transporter / Play Console.

## Customer support

All purchase, access, refund, and parental-consent questions go to
<ask@drkayjay.com>.

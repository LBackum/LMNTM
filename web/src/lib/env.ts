import { z } from "zod";

/**
 * Environment schema. Server-side code reads `serverEnv`; client code only ever
 * sees the NEXT_PUBLIC_* values through `publicEnv`. Anything in `serverEnv`
 * must NEVER be exposed to the browser bundle.
 *
 * Placeholder-friendly: empty-string env vars (e.g. `STRIPE_SECRET_KEY=`) are
 * coerced to `undefined` before validation, so `.env.local` can ship with
 * empty slots without blowing up `next build`.
 */
const emptyToUndefined = z.preprocess(
  (v) => (typeof v === "string" && v.length === 0 ? undefined : v),
  z.unknown(),
);

const optionalString = (min = 1) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.length === 0 ? undefined : v),
    z.string().min(min).optional(),
  );

const optionalUrl = () =>
  z.preprocess(
    (v) => (typeof v === "string" && v.length === 0 ? undefined : v),
    z.string().url().optional(),
  );

const optionalEnum = <T extends [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.length === 0 ? undefined : v),
    z.enum(values).optional(),
  );

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),

  NEXT_PUBLIC_SUPABASE_URL: optionalUrl(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString(),
  SUPABASE_SERVICE_ROLE_KEY: optionalString(),

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalString(),
  STRIPE_SECRET_KEY: optionalString(),
  STRIPE_WEBHOOK_SECRET: optionalString(),

  RESEND_API_KEY: optionalString(),
  SUPPORT_EMAIL: z.string().email().default("ask@drkayjay.com"),

  TRANSLATION_PROVIDER: optionalEnum(["deepl", "google"]),
  TRANSLATION_API_KEY: optionalString(),
});

const clientSchema = serverSchema.pick({
  NEXT_PUBLIC_SITE_URL: true,
  NEXT_PUBLIC_SUPABASE_URL: true,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: true,
});

export const serverEnv = serverSchema.parse(process.env);
export const publicEnv = clientSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
});

void emptyToUndefined;

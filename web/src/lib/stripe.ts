import Stripe from "stripe";
import { serverEnv } from "@/lib/env";

/**
 * Server-side Stripe client. Returns null if STRIPE_SECRET_KEY isn't set so
 * build-time imports don't fail in unconfigured environments.
 */
export function getStripe(): Stripe | null {
  if (!serverEnv.STRIPE_SECRET_KEY) return null;
  return new Stripe(serverEnv.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia",
    typescript: true,
    appInfo: { name: "lmntm-web", version: "0.1.0" },
  });
}

/** Pricing lives in cents and is enforced server-side — never trust the client. */
export const PRICING = {
  chapter: { amount: 299, currency: "usd", name: (n: number) => `Chapter ${n}` },
  "full-book": { amount: 2000, currency: "usd", name: () => "Lessons Mama Never Taught Me — full book" },
} as const;

export type Sku = keyof typeof PRICING;

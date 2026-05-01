import Stripe from "stripe";

let _stripe: Stripe | null = null;

// Lazy proxy so the Stripe client isn't instantiated at module load. Otherwise
// `next build` fails on machines without STRIPE_SECRET_KEY (e.g. local builds
// without an env file).
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    if (!_stripe) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
      _stripe = new Stripe(key, { typescript: true });
    }
    return Reflect.get(_stripe, prop, _stripe);
  },
});

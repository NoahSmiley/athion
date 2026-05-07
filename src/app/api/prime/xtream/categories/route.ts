import { getCategories } from "@/lib/xtream/client";
import { preflight, withPrimeAuth } from "@/lib/xtream/route-helpers";

export async function OPTIONS(req: Request) {
  return preflight(req);
}

export async function GET(req: Request) {
  return withPrimeAuth(req, async () => ({ body: await getCategories() }));
}

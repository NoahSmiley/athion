import { getLiveStreams } from "@/lib/xtream/client";
import { preflight, withPrimeAuth } from "@/lib/xtream/route-helpers";

export async function OPTIONS(req: Request) {
  return preflight(req);
}

export async function GET(req: Request) {
  return withPrimeAuth(req, async () => {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") ?? undefined;
    return { body: await getLiveStreams(category) };
  });
}

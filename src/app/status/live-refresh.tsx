"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LiveRefresh({ intervalSeconds }: { intervalSeconds: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalSeconds * 1000);
    return () => clearInterval(id);
  }, [router, intervalSeconds]);
  return null;
}

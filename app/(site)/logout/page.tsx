"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerKey } from "../lib/auth";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try { await logout(); } finally { router.push("/"); }
    })();
  }, [router]);

  return <div className="p-6">Signing out...</div>;
}

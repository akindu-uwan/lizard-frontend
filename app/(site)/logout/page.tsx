"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { keyAuthApi } from "@/app/lib/adminApi";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await keyAuthApi.logout();
      } catch (e) {
        console.error("Logout failed:", e);
      } finally {
        router.push("/");
      }
    })();
  }, [router]);

  return <div className="p-6">Signing out...</div>;
}

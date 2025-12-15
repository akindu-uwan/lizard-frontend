"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { keyAuthApi } from "@/app/api/admin/route";

export default function LoginPage() {
  const router = useRouter();
  const [loginKey, setLoginKey] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    setErr(null);
    setLoading(true);
    try {
    await keyAuthApi.login(loginKey);
      router.push("/");
    } catch (e: any) {
      setErr(e?.message || "Invalid login key");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="mt-2 text-sm opacity-80">Enter your login key to continue.</p>

      <label className="block mt-6 text-sm">Login key</label>
      <textarea
        className="mt-2 w-full min-h-[120px] rounded-lg border px-3 py-2 bg-transparent font-mono text-sm"
        value={loginKey}
        onChange={(e) => setLoginKey(e.target.value)}
        placeholder="Paste your login key..."
      />

      {err && <p className="mt-3 text-sm text-red-500">{err}</p>}

      <button
        className="mt-6 w-full px-4 py-2 rounded-lg border"
        onClick={onLogin}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}

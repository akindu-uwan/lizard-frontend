"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { keyAuthApi } from "@/app/lib/adminApi";

export default function SignupPage() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [loginKey, setLoginKey] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onCreate() {
    setErr(null);
    setLoading(true);
    try {
    const res = await keyAuthApi.register(label);
        setLoginKey(res.loginKey);
    } catch (e: any) {
      setErr(e?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  async function copyKey() {
    if (!loginKey) return;
    await navigator.clipboard.writeText(loginKey);
  }

  if (loginKey) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <h1 className="text-2xl font-semibold">Save your login key</h1>
        <p className="mt-2 text-sm opacity-80">
          This will be shown only once. Keep it safe.
        </p>

        <div className="mt-4 rounded-xl border p-4 break-all font-mono text-sm">
          {loginKey}
        </div>

        <div className="mt-4 flex gap-2">
          <button className="px-4 py-2 rounded-lg border" onClick={copyKey}>
            Copy
          </button>
          <button
            className="px-4 py-2 rounded-lg border"
            onClick={() => router.push("/")}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-2 text-sm opacity-80">
        We’ll generate a unique login key. No email required.
      </p>

      <label className="block mt-6 text-sm">Label (optional)</label>
      <input
        className="mt-2 w-full rounded-lg border px-3 py-2 bg-transparent"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="e.g., Leo laptop"
      />

      {err && <p className="mt-3 text-sm text-red-500">{err}</p>}

      <button
        className="mt-6 w-full px-4 py-2 rounded-lg border"
        onClick={onCreate}
        disabled={loading}
      >
        {loading ? "Creating..." : "Generate login key"}
      </button>
    </div>
  );
}

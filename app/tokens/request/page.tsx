"use client";

import { useState } from "react";
import Link from "next/link";
import { apiPost } from "@/app/api/directory/route";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

type TokenType = "ERC20" | "BEP20" | "SPL" | "Other";

export default function TokenRequestPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    tokenName: "",
    tokenSymbol: "",
    chain: "",
    contractAddress: "",
    tokenType: "ERC20" as TokenType,
    tokenLogoUrl: "",
    website: "",
    description: "",
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      // ✅ Build payload to match Zod
      // - required: always strings
      // - optional: omit if empty (never send null)
      const payload: any = {
        tokenName: form.tokenName.trim(),
        tokenSymbol: form.tokenSymbol.trim(),
        chain: form.chain.trim(),
        contractAddress: form.contractAddress.trim(),
        tokenType: form.tokenType,
      };

      const logo = form.tokenLogoUrl.trim();
      const site = form.website.trim();
      const desc = form.description.trim();

      if (logo !== "") payload.tokenLogoUrl = logo;
      if (site !== "") payload.website = site;
      if (desc !== "") payload.description = desc;

      await apiPost("/api/tokenrequests", payload);

      setSuccess(true);
      setForm({
        tokenName: "",
        tokenSymbol: "",
        chain: "",
        contractAddress: "",
        tokenType: "ERC20",
        tokenLogoUrl: "",
        website: "",
        description: "",
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to submit token request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-600">
            Listings
          </p>

          <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            Request a token listing
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Submit token details for review. Status starts as{" "}
            <span className="font-semibold">pending</span>.
          </p>
        </div>

        <div className="flex items-start md:items-end">
          <Link href="/tokens">
            <Button size="sm" className="px-4 py-2 rounded-full">
              Back to tokens
            </Button>
          </Link>
        </div>
      </section>

      <Card className="p-6 md:p-8 bg-white/90">
        {success && (
          <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Token request submitted successfully.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600">
                Token name
              </label>
              <input
                value={form.tokenName}
                onChange={(e) => set("tokenName", e.target.value)}
                required
                className="mt-1 w-full rounded-2xl bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="e.g. USD Tether"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600">
                Token symbol
              </label>
              <input
                value={form.tokenSymbol}
                onChange={(e) => set("tokenSymbol", e.target.value)}
                required
                className="mt-1 w-full rounded-2xl bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="e.g. USDT"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600">
                Chain
              </label>
              <input
                value={form.chain}
                onChange={(e) => set("chain", e.target.value)}
                required
                className="mt-1 w-full rounded-2xl bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="e.g. Ethereum / BSC / Solana"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600">
                Token type
              </label>
              <select
                value={form.tokenType}
                onChange={(e) => set("tokenType", e.target.value)}
                className="mt-1 w-full rounded-2xl bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="ERC20">ERC20</option>
                <option value="BEP20">BEP20</option>
                <option value="SPL">SPL</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600">
              Contract address
            </label>
            <input
              value={form.contractAddress}
              onChange={(e) => set("contractAddress", e.target.value)}
              required
              className="mt-1 w-full rounded-2xl bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="0x… / SPL mint address"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Must be unique (your backend enforces uniqueness).
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600">
                Token logo URL (optional)
              </label>
              <input
                value={form.tokenLogoUrl}
                onChange={(e) => set("tokenLogoUrl", e.target.value)}
                className="mt-1 w-full rounded-2xl bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="https://…/logo.png"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600">
                Website (optional)
              </label>
              <input
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                className="mt-1 w-full rounded-2xl bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="https://…"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600">
              Description (optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="mt-1 min-h-[110px] w-full rounded-2xl bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Short description about the token…"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-slate-500">
              By submitting, you confirm the information is correct.
            </p>

            <Button
              type="submit"
              size="sm"
              className="px-5 py-2 rounded-full"
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit request"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

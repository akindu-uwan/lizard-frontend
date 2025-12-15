"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { apiPost } from "@/app/api/directory/route";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import {
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Info,
  Sparkles,
} from "lucide-react";
import { cn } from "@/app/components/ui/cn";

type TokenType = "ERC20" | "BEP20" | "SPL" | "Other";

function shortAddr(addr: string) {
  const a = addr.trim();
  if (a.length <= 16) return a;
  return `${a.slice(0, 10)}…${a.slice(-6)}`;
}

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

  const preview = useMemo(() => {
    const name = form.tokenName.trim() || "Token name";
    const sym = form.tokenSymbol.trim() || "SYMBOL";
    const chain = form.chain.trim() || "Chain";
    const addr = form.contractAddress.trim() || "Contract / mint address";
    const desc = form.description.trim();
    const logo = form.tokenLogoUrl.trim();
    const site = form.website.trim();

    return { name, sym, chain, addr, desc, logo, site };
  }, [form]);

  const canSubmit =
    form.tokenName.trim() &&
    form.tokenSymbol.trim() &&
    form.chain.trim() &&
    form.contractAddress.trim();

  return (
    <div className="relative space-y-6">
      {/* Lizard aura */}
      <div className="pointer-events-none absolute -top-24 left-0 h-64 w-64 rounded-full bg-emerald-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-purple-200/45 blur-3xl" />
      <div className="pointer-events-none absolute top-12 left-1/2 h-40 w-[720px] -translate-x-1/2 rounded-full bg-sky-200/30 blur-3xl" />

      {/* Header */}
      <section className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-600">
            Listings
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            Request a token listing
          </h1>

          <p className="max-w-2xl text-sm text-slate-600">
            Submit token details for review. Status starts as{" "}
            <span className="font-semibold">PENDING</span>.
          </p>

          <div className="h-px w-full max-w-2xl bg-linear-to-r from-transparent via-slate-200 to-transparent" />
        </div>

        <div className="flex items-start md:items-end">
          <Link href="/tokens">
            <Button
              size="sm"
              variant="secondary"
              className="px-4 py-2 rounded-2xl inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to tokens
            </Button>
          </Link>
        </div>
      </section>

      {/* Main layout */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1.2fr)]">
        {/* Form card */}
        <Card className="relative overflow-hidden bg-white/90">
          {/* Accent */}
          <div className="px-6 md:px-8 pt-6">
            <div className="h-[3px] w-16 rounded-full bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 opacity-80" />
          </div>

          <div className="px-6 md:px-8 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Token listing request
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Use official links and the correct contract / mint address.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-[11px] text-slate-600 ring-1 ring-slate-100">
              <Info className="h-3.5 w-3.5 text-slate-400" />
              Required fields are needed to submit
            </span>
          </div>

          <div className="px-6 md:px-8 py-6">
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

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Core identity */}
              <div className="rounded-3xl bg-slate-50/70 p-4 ring-1 ring-slate-100">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Token identity
                  </p>
                  <span className="text-[11px] text-slate-500">
                    Keep names consistent with the official site.
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">
                      Token name <span className="text-red-500">*</span>
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
                      Token symbol <span className="text-red-500">*</span>
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
                      Chain <span className="text-red-500">*</span>
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
                      Token type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.tokenType}
                      onChange={(e) =>
                        set("tokenType", e.target.value as TokenType)
                      }
                      className="mt-1 w-full rounded-2xl bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    >
                      <option value="ERC20">ERC20</option>
                      <option value="BEP20">BEP20</option>
                      <option value="SPL">SPL</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                    Contract / mint address
                  </p>
                  <span className="text-[11px] text-slate-500">
                    Must be unique (backend enforces it).
                  </span>
                </div>

                <label className="text-[11px] font-semibold text-slate-600">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.contractAddress}
                  onChange={(e) => set("contractAddress", e.target.value)}
                  required
                  className="mt-1 w-full rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 font-mono"
                  placeholder="0x… / SPL mint address"
                />
                <p className="mt-2 text-[11px] text-slate-500">
                  Tip: paste from the official block explorer page to avoid
                  mistakes.
                </p>
              </div>

              {/* Optional metadata */}
              <div className="rounded-3xl bg-slate-50/70 p-4 ring-1 ring-slate-100">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Optional details
                  </p>
                  <span className="text-[11px] text-slate-500">
                    Helps your listing look nicer.
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">
                      Token logo URL
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
                      Website
                    </label>
                    <input
                      value={form.website}
                      onChange={(e) => set("website", e.target.value)}
                      className="mt-1 w-full rounded-2xl bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="https://…"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-[11px] font-semibold text-slate-600">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    className="mt-1 min-h-[110px] w-full rounded-2xl bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="Short description about the token…"
                  />
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 pt-4">
                <p className="text-[11px] text-slate-500">
                  By submitting, you confirm the information is correct.
                </p>

                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting || !canSubmit}
                  className={cn(
                    "px-5 py-2 rounded-2xl",
                    "bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 text-white",
                    "shadow-lg shadow-emerald-200/60 hover:brightness-110",
                    (!canSubmit || submitting) && "opacity-70"
                  )}
                >
                  {submitting ? "Submitting…" : "Submit request"}
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Preview card */}
        <div className="space-y-4">
          <Card className="p-5 bg-white/80">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Listing preview
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-sky-700 ring-1 ring-sky-200">
                <Sparkles className="h-3.5 w-3.5" />
                PENDING
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              This is how your token will visually appear in the Tokens page.
            </p>

            <div className="mt-4 rounded-3xl bg-white/90 p-4 ring-1 ring-slate-100 shadow-md shadow-slate-200/60">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-emerald-200 via-sky-200 to-purple-200 text-xs font-semibold text-slate-800 ring-1 ring-slate-100">
                  {preview.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview.logo}
                      alt="Token logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (preview.sym?.[0] || "?").toUpperCase()
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        {preview.name}{" "}
                        <span className="text-slate-500 font-semibold">
                          · {preview.sym}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {preview.chain} • {form.tokenType}
                      </p>
                    </div>

                    {preview.site ? (
                      <a
                        href={preview.site}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Site
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[11px] text-slate-400 ring-1 ring-slate-200">
                        <ExternalLink className="h-3 w-3" />
                        No site
                      </span>
                    )}
                  </div>

                  <div className="mt-2 rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                    <p className="text-[11px] text-slate-600 font-mono break-all">
                      {preview.addr.includes("…")
                        ? preview.addr
                        : preview.addr === "Contract / mint address"
                        ? preview.addr
                        : shortAddr(preview.addr)}
                    </p>
                  </div>

                  {preview.desc && (
                    <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-2">
                      {preview.desc}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-sky-700 ring-1 ring-sky-200">
                      PENDING
                    </span>

                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      After approval → Listed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white/80">
            <h3 className="text-sm font-semibold text-slate-900">
              Submission tips
            </h3>
            <ul className="mt-2 space-y-2 text-xs text-slate-600">
              <li className="flex gap-2">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 flex items-center justify-center text-[11px] font-semibold">
                  1
                </span>
                Use the official chain name (e.g. Ethereum, Arbitrum, Solana).
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 flex items-center justify-center text-[11px] font-semibold">
                  2
                </span>
                Paste the exact contract/mint address from explorer.
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 flex items-center justify-center text-[11px] font-semibold">
                  3
                </span>
                Add logo + website for the best visual listing.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

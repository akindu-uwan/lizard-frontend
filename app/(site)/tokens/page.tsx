"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  PlusCircle,
  Search,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";
import { apiGet } from "@/app/lib/http";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { cn } from "@/app/components/ui/cn";

type Token = {
  _id: string;
  tokenName: string;
  tokenSymbol: string;
  chain: string;
  contractAddress: string;

  tokenType?: "ERC20" | "BEP20" | "SPL" | "Other" | string;
  tokenLogoUrl?: string | null;
  website?: string | null;
  description?: string | null;

  status: "pending" | "approved" | "rejected" | string;
  createdAt?: string;
  updatedAt?: string;
};

function statusPill(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "approved") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (s === "pending") return "bg-sky-50 text-sky-700 ring-sky-200";
  if (s === "rejected") return "bg-red-50 text-red-700 ring-red-200";
  return "bg-slate-50 text-slate-600 ring-slate-200";
}

function shortAddr(addr?: string) {
  if (!addr) return "";
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTokens() {
      try {
        setLoading(true);
        setError(null);

        const data: Token[] = await apiGet("/api/tokens");
        setTokens(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load tokens");
      } finally {
        setLoading(false);
      }
    }

    fetchTokens();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return tokens;

    return tokens.filter((t) => {
      return (
        t.tokenName?.toLowerCase().includes(s) ||
        t.tokenSymbol?.toLowerCase().includes(s) ||
        t.chain?.toLowerCase().includes(s) ||
        t.contractAddress?.toLowerCase().includes(s) ||
        (t.tokenType || "").toLowerCase().includes(s)
      );
    });
  }, [q, tokens]);

  const handleCopy = async (tokenId: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(tokenId);
      setTimeout(() => setCopiedId(null), 1400);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

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
            Supported tokens
          </h1>

          <p className="max-w-2xl text-sm text-slate-600">
            Tokens available in the Lizard directory. Request a new listing if
            yours is missing.
          </p>

          <div className="h-px w-full max-w-2xl bg-linear-to-r from-transparent via-slate-200 to-transparent" />
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <Link href="/tokens/request">
            <Button
              size="sm"
              className={cn(
                "px-4 py-2 rounded-2xl inline-flex items-center gap-2",
                "bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 text-white",
                "shadow-lg shadow-emerald-200/60 hover:brightness-110"
              )}
            >
              <PlusCircle className="h-4 w-4" />
              Request token listing
            </Button>
          </Link>

          <p className="text-[11px] text-slate-500 max-w-xs text-left md:text-right">
            Submit token details and we’ll review it for integration.
          </p>
        </div>
      </section>

      {/* Content */}
      <Card className="relative overflow-hidden p-5 bg-white/90">
        {/* Accent */}
        <div className="mb-4 h-[3px] w-16 rounded-full bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 opacity-80" />

        {/* Search + count */}
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-slate-500">
            {!loading && !error ? (
              <>
                {filtered.length} token{filtered.length !== 1 ? "s" : ""}
              </>
            ) : (
              " "
            )}
          </p>

          <div className="w-full md:w-[360px]">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 ring-1 ring-slate-100 focus-within:ring-emerald-200">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, symbol, chain, address…"
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {loading && <p className="text-sm text-slate-500">Loading tokens…</p>}

        {error && <p className="text-sm text-red-500">Error: {error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500">
            No tokens found. Try a different search, or request a listing.
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((t) => {
              const approved = String(t.status).toLowerCase() === "approved";

              return (
                <article
                  key={t._id}
                  className={cn(
                    "group relative flex items-start gap-3 rounded-3xl bg-white/80 p-4",
                    "ring-1 ring-slate-100 shadow-md shadow-slate-200/60",
                    "transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-100/60"
                  )}
                >
                  {/* tiny top accent */}
                  <div className="absolute left-4 top-0 h-[3px] w-16 rounded-full bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 opacity-70" />

                  {/* Logo */}
                  <div className="relative mt-1">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-emerald-200 via-sky-200 to-purple-200 text-xs font-semibold text-slate-800 ring-1 ring-slate-100">
                      {t.tokenLogoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.tokenLogoUrl}
                          alt={`${t.tokenName} logo`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        (t.tokenSymbol?.[0] || "?").toUpperCase()
                      )}
                    </div>

                    <div className="pointer-events-none absolute -inset-2 -z-10 rounded-3xl bg-linear-to-br from-emerald-200/0 via-sky-200/0 to-purple-200/0 blur-md transition group-hover:from-emerald-200/55 group-hover:via-sky-200/45 group-hover:to-purple-200/55" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-semibold text-slate-900">
                            {t.tokenName}
                          </h2>
                          {approved && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                              <ShieldCheck className="h-3 w-3" />
                              Listed
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-600">
                            {t.tokenSymbol}
                          </span>{" "}
                          • {t.chain}
                          {t.tokenType ? ` • ${t.tokenType}` : ""}
                        </p>
                      </div>

                      {t.website && (
                        <a
                          href={t.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Site
                        </a>
                      )}
                    </div>

                    {/* Address row */}
                    <div className="mt-2 flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                      <p className="text-[11px] text-slate-600 font-mono break-all">
                        {shortAddr(t.contractAddress)}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleCopy(t._id, t.contractAddress)}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                        title="Copy contract address"
                      >
                        {copiedId === t._id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    {t.description && (
                      <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-2">
                        {t.description}
                      </p>
                    )}

                    {/* status */}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1",
                          statusPill(t.status)
                        )}
                      >
                        {String(t.status).toUpperCase()}
                      </span>

                      {/* tiny hint */}
                      <span className="text-[10px] text-slate-400">
                        {t.updatedAt ? `Updated` : ""}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

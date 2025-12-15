"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, PlusCircle } from "lucide-react";
import { apiGet } from "@/app/api/directory/route";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

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

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");

  useEffect(() => {
    async function fetchTokens() {
      try {
        setLoading(true);
        setError(null);

        // ✅ change to your real backend route if different:
        // e.g. "/api/tokens" or "/api/tokens/all"
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-600">
            Listings
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            Supported tokens
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Tokens available in the Lizard directory. Request a new listing if yours is missing.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <Link href="/tokens/request">
            <Button
              size="sm"
              className="px-4 py-2 rounded-full inline-flex items-center gap-2"
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
      <Card className="p-5 bg-white/90">
        {/* Search */}
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

          <div className="w-full md:w-80">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, symbol, chain, address…"
              className="w-full rounded-full bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>

        {loading && <p className="text-sm text-slate-500">Loading tokens…</p>}

        {error && <p className="text-sm text-red-500">Error: {error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-slate-500">
            No tokens found. Try a different search, or request a listing.
          </p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map((t) => (
              <article
                key={t._id}
                className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3"
              >
                {/* “logo” */}
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-emerald-200 via-sky-200 to-purple-200 text-xs font-semibold text-slate-800">
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

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        {t.tokenName}{" "}
                        <span className="text-slate-500 font-semibold">
                          · {t.tokenSymbol}
                        </span>
                      </h2>

                      <p className="text-[11px] text-slate-500">
                        {t.chain}
                        {t.tokenType ? ` • ${t.tokenType}` : ""}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-500 break-all">
                        {t.contractAddress}
                      </p>

                      {t.description && (
                        <p className="mt-2 text-[12px] text-slate-600 line-clamp-2">
                          {t.description}
                        </p>
                      )}
                    </div>

                    {t.website && (
                      <a
                        href={t.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Site
                      </a>
                    )}
                  </div>

                  {/* status pill */}
                  <div className="mt-2">
                    <span className="inline-flex items-center rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                      {String(t.status).toUpperCase()}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

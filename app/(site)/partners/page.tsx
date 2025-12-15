"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShieldCheck, ExternalLink, Search, Sparkles } from "lucide-react";
import { apiGet } from "@/app/lib/http";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { cn } from "@/app/components/ui/cn";

type Partner = {
  _id: string;
  projectName: string;
  serviceType: string;
  primaryChain: string;
  website?: string;
  status: "pending" | "approved" | "rejected" | string;
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // minimal “product-feel” controls
  const [q, setQ] = useState("");
  const [approvedOnly, setApprovedOnly] = useState(false);

  useEffect(() => {
    async function fetchPartners() {
      try {
        setLoading(true);
        setError(null);
        const data: Partner[] = await apiGet("/api/partners");
        setPartners(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load partners");
      } finally {
        setLoading(false);
      }
    }
    fetchPartners();
  }, []);

  const results = useMemo(() => {
    let list = [...partners];

    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.projectName?.toLowerCase().includes(term) ||
          p.serviceType?.toLowerCase().includes(term) ||
          p.primaryChain?.toLowerCase().includes(term)
      );
    }

    if (approvedOnly) {
      list = list.filter((p) => p.status === "approved");
    }

    // keep approved first for better UX
    list.sort((a, b) => {
      const aScore = a.status === "approved" ? 2 : a.status === "pending" ? 1 : 0;
      const bScore = b.status === "approved" ? 2 : b.status === "pending" ? 1 : 0;
      return bScore - aScore || a.projectName.localeCompare(b.projectName);
    });

    return list;
  }, [partners, q, approvedOnly]);

  const statusBadge = (status: string) => {
    const s = (status || "").toLowerCase();

    if (s === "approved") {
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    }
    if (s === "pending") {
      return "bg-sky-50 text-sky-700 ring-sky-200";
    }
    if (s === "rejected") {
      return "bg-red-50 text-red-700 ring-red-200";
    }
    return "bg-slate-50 text-slate-600 ring-slate-200";
  };

  return (
    <div className="relative space-y-6">
      {/* page aura like Swap/Directory */}
      <div className="pointer-events-none absolute -top-24 left-0 h-64 w-64 rounded-full bg-emerald-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-purple-200/45 blur-3xl" />
      <div className="pointer-events-none absolute top-12 left-1/2 h-40 w-[720px] -translate-x-1/2 rounded-full bg-sky-200/30 blur-3xl" />

      {/* Header section */}
      <section className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-600">
            Partners
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            Routing partners in Lizard
          </h1>

          <p className="max-w-2xl text-sm text-slate-600">
            Protocols, DEXes, bridges and tools that Lizard can route through.
          </p>

          {/* subtle divider */}
          <div className="h-px w-full max-w-xl bg-linear-to-r from-transparent via-slate-200 to-transparent" />
        </div>

        <div className="flex flex-col items-start gap-2 md:items-end">
          <Link href="/partners/apply">
            <Button
              size="sm"
              className={cn(
                "rounded-2xl px-4 py-2",
                "bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 text-white",
                "shadow-lg shadow-emerald-200/60 hover:brightness-110"
              )}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Become a routing partner
            </Button>
          </Link>

          <p className="max-w-xs text-left text-[11px] text-slate-500 md:text-right">
            Fill out a short application and our team will review your protocol
            for integration.
          </p>
        </div>
      </section>

      {/* Controls */}
      <Card className="relative overflow-hidden p-4 md:p-5">
        {/* accent line */}
        <div className="mb-4 h-[3px] w-16 rounded-full bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 opacity-80" />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 ring-1 ring-slate-100 focus-within:ring-emerald-200">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search partner, type or chain…"
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-700 ring-1 ring-slate-100">
            <input
              type="checkbox"
              checked={approvedOnly}
              onChange={(e) => setApprovedOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
            />
            Approved only
          </label>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          {loading ? "Loading…" : error ? "Error" : `${results.length} partner(s)`}
        </div>
      </Card>

      {/* Content */}
      <Card className="p-5 bg-white/90">
        {loading && <p className="text-sm text-slate-500">Loading partners…</p>}

        {error && <p className="text-sm text-red-500">Error: {error}</p>}

        {!loading && !error && results.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500">
            No partners match your filters.
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((partner) => {
              const isApproved = partner.status === "approved";

              return (
                <article
                  key={partner._id}
                  className={cn(
                    "group relative flex items-start gap-3 rounded-3xl bg-white/80 p-4",
                    "ring-1 ring-slate-100 shadow-md shadow-slate-200/60",
                    "transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-100/60"
                  )}
                >
                  {/* tiny premium top accent */}
                  <div className="absolute left-4 top-0 h-[3px] w-16 rounded-full bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 opacity-70" />

                  <div className="relative mt-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-200 via-sky-200 to-purple-200 text-xs font-semibold text-slate-800 ring-1 ring-slate-100">
                      {partner.projectName?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="pointer-events-none absolute -inset-2 -z-10 rounded-3xl bg-linear-to-br from-emerald-200/0 via-sky-200/0 to-purple-200/0 blur-md transition group-hover:from-emerald-200/55 group-hover:via-sky-200/45 group-hover:to-purple-200/55" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                            {partner.projectName}
                          </h2>

                          {isApproved && (
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          )}

                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-medium ring-1",
                              statusBadge(partner.status)
                            )}
                          >
                            {(partner.status || "unknown").replaceAll("_", " ")}
                          </span>
                        </div>

                        <p className="mt-1 text-[11px] text-slate-500">
                          {partner.serviceType} • {partner.primaryChain}
                        </p>
                      </div>

                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200 hover:bg-white"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Site
                        </a>
                      )}
                    </div>

                    {/* micro helper line (minimal, but “system-feel”) */}
                    <p className="mt-3 text-[11px] text-slate-500">
                      {isApproved
                        ? "Eligible for routing when integration is enabled."
                        : "Listed for review or awaiting approval."}
                    </p>
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

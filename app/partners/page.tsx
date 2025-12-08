"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, ExternalLink } from "lucide-react";
import { apiGet } from "@/app/lib/api";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

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

  useEffect(() => {
    async function fetchPartners() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiGet<Partner[]>("/api/partners?status=approved");
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

  return (
    <div className="space-y-6">
      {/* Header section */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-600">
            Partners
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            Routing partners in Lizard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Protocols, DEXes, bridges and tools that Lizard can route through.
            Approved partners appear both here and in the services directory.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <Button asChild size="sm" className="px-4 py-2 rounded-full">
            <Link href="/partners/apply">
              Become a routing partner
            </Link>
          </Button>
          <p className="text-[11px] text-slate-500 max-w-xs text-left md:text-right">
            Fill out a short application and our team will review your protocol
            for integration.
          </p>
        </div>
      </section>

      {/* Content */}
      <Card className="p-5 bg-white/90">
        {loading && (
          <p className="text-sm text-slate-500">Loading partners…</p>
        )}

        {error && (
          <p className="text-sm text-red-500">Error: {error}</p>
        )}

        {!loading && !error && partners.length === 0 && (
          <p className="text-sm text-slate-500">
            No partners have been listed yet. Your protocol could be one of the first.
          </p>
        )}

        {!loading && !error && partners.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              {partners.length} partner{partners.length > 1 ? "s" : ""} integrated.
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              {partners.map((partner) => (
                <article
                  key={partner._id}
                  className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-200 via-sky-200 to-purple-200 text-xs font-semibold text-slate-800">
                    {partner.projectName[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1">
                          <h2 className="text-sm font-semibold text-slate-900">
                            {partner.projectName}
                          </h2>
                          {partner.status === "approved" && (
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {partner.serviceType} • {partner.primaryChain}
                        </p>
                      </div>
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Site
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

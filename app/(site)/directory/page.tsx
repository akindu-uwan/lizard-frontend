"use client";

import { useMemo, useState, useEffect } from "react";
import { ChevronDown, Search, ShieldCheck, Sparkles, SlidersHorizontal } from "lucide-react";
import { apiGet } from "@/app/lib/http";
import { Service } from "@/app/types/service";
import Link from "next/link";

type ServiceType = "Exchange" | "Aggregator" | "Tool" | "Host" | "Bridge";
type SortOption = "score_desc" | "score_asc" | "name_asc";

export default function DirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("score_desc");
  const [selectedTypes, setSelectedTypes] = useState<ServiceType[]>([]);
  const [showVerified, setShowVerified] = useState(false); // ✅ fix: boolean

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiGet("/api/services");
        setServices(data);
      } catch (err: any) {
        setError(err.message || "Failed to load services");
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const toggleType = (t: ServiceType) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  // Helper function to get display properties
  const getServiceDisplayProps = (service: Service) => {
    const isVerified =
      service.verificationStatus === "verified" ||
      service.verificationStatus === "approved";

    const score = service.trustScore || service.privacyScore || 0;
    const tags = service.attributes || [];
    const kycLevel = service.kycLevel || 0;

    return { isVerified, score, tags, kycLevel };
  };

  const results = useMemo(() => {
    if (loading || error) return [];

    let list = [...services];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (service) =>
          service.name.toLowerCase().includes(term) ||
          service.description?.toLowerCase().includes(term)
      );
    }

    // Type filter (normalize to avoid backend casing differences)
    if (selectedTypes.length) {
      const wanted = new Set(selectedTypes.map((t) => t.toLowerCase()));
      list = list.filter((service) =>
        wanted.has(String(service.type || "").toLowerCase())
      );
    }

    // Verification filter
    if (showVerified) {
      list = list.filter(
        (service) =>
          service.verificationStatus === "verified" ||
          service.verificationStatus === "approved"
      );
    }

    // Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case "score_asc":
          return (a.trustScore || 0) - (b.trustScore || 0);
        case "name_asc":
          return a.name.localeCompare(b.name);
        default:
          return (b.trustScore || 0) - (a.trustScore || 0);
      }
    });

    return list;
  }, [services, searchTerm, sortBy, selectedTypes, showVerified, loading, error]);

  const activeFilterCount =
    (searchTerm.trim() ? 1 : 0) + (selectedTypes.length ? 1 : 0) + (showVerified ? 1 : 0);

  return (
    <div className="relative">
      {/* subtle page aura like Swap */}
      <div className="pointer-events-none absolute -top-24 left-0 h-64 w-64 rounded-full bg-emerald-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-purple-200/45 blur-3xl" />
      <div className="pointer-events-none absolute top-12 left-1/2 h-40 w-[720px] -translate-x-1/2 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="relative flex flex-1 flex-col gap-6 md:flex-row">
        {/* Sidebar */}
        <aside className="hidden w-72 shrink-0 md:block">
          <div className="sticky top-24 rounded-3xl bg-white/70 p-4 shadow-md shadow-emerald-100/60 ring-1 ring-slate-100">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Filters
              </h2>
              <div className="flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[10px] text-slate-600 ring-1 ring-slate-200">
                <SlidersHorizontal className="h-3 w-3" />
                {activeFilterCount} active
              </div>
            </div>

            {loading && <div className="text-xs text-slate-500">Loading filters...</div>}
            {error && <div className="text-xs text-red-500">Error loading filters</div>}

            {!loading && !error && (
              <>
                {/* Sort */}
                <div className="mb-4 space-y-1">
                  <span className="text-xs font-medium text-slate-500">Sort by</span>

                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-2">
                    <div className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700 ring-1 ring-slate-200">
                      {sortBy === "score_desc" && "Score (High → Low)"}
                      {sortBy === "score_asc" && "Score (Low → High)"}
                      {sortBy === "name_asc" && "Name (A → Z)"}
                      <ChevronDown className="h-3 w-3 text-slate-500" />
                    </div>

                    <div className="flex flex-wrap gap-1 pt-2">
                      <button
                        onClick={() => setSortBy("score_desc")}
                        className={`rounded-full px-2 py-0.5 text-[10px] transition ${
                          sortBy === "score_desc"
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        Score ↓
                      </button>

                      <button
                        onClick={() => setSortBy("score_asc")}
                        className={`rounded-full px-2 py-0.5 text-[10px] transition ${
                          sortBy === "score_asc"
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        Score ↑
                      </button>

                      <button
                        onClick={() => setSortBy("name_asc")}
                        className={`rounded-full px-2 py-0.5 text-[10px] transition ${
                          sortBy === "name_asc"
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        Name
                      </button>
                    </div>
                  </div>
                </div>

                {/* Search */}
                <div className="mb-4 space-y-1">
                  <span className="text-xs font-medium text-slate-500">Name</span>
                  <div className="flex items-center rounded-2xl border border-slate-200 bg-white/70 px-2 ring-1 ring-slate-100 focus-within:ring-emerald-200">
                    <Search className="h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full bg-transparent px-2 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Type */}
                <div className="mb-4 space-y-2">
                  <span className="text-xs font-medium text-slate-500">Type</span>

                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-3 ring-1 ring-slate-100">
                    <div className="space-y-2 text-xs text-slate-700">
                      {(["Exchange", "Aggregator", "Tool", "Host", "Bridge"] as ServiceType[]).map(
                        (t) => (
                          <label key={t} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                              checked={selectedTypes.includes(t)}
                              onChange={() => toggleType(t)}
                            />
                            <span>{t}</span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-slate-500">Verification</span>

                  <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 p-3 text-xs text-slate-700 ring-1 ring-slate-100">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Verified only
                    </span>

                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                      checked={showVerified}
                      onChange={(e) => setShowVerified(e.target.checked)}
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Main list */}
        <section className="flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-600">
                Directory
              </div>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                Verified Services Directory
              </h1>

              <p className="text-sm text-slate-600">
                {loading ? "Loading..." : error ? "Error" : `${results.length} results`}
              </p>
            </div>

            <Link
              href="/directory/add-service"
              className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-200/60 hover:brightness-110"
            >
              <Sparkles className="h-4 w-4" />
              Add service
            </Link>
          </div>

          {/* subtle divider like Swap */}
          <div className="mb-5 h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent" />

          {/* Loading */}
          {loading && (
            <div className="rounded-3xl bg-white/70 p-8 text-center text-sm text-slate-500 ring-1 ring-slate-100">
              Loading services...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-3xl bg-red-50 p-8 text-center text-sm text-red-600 ring-1 ring-red-200">
              Error: {error}
            </div>
          )}

          {/* Results */}
          {!loading && !error && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {results.map((service) => {
                const { isVerified, score, tags, kycLevel } =
                  getServiceDisplayProps(service);

                const statusText = service.verificationStatus || "not_verified";

                return (
                  <Link
                    key={service._id}
                    href={`/directory/${service._id}`}
                    className="group block"
                  >
                    <article className="relative flex h-full flex-col rounded-3xl bg-white/90 p-4 shadow-md shadow-slate-200/70 ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-100/60">
                      {/* tiny premium top accent line */}
                      <div className="mb-3 h-[3px] w-16 rounded-full bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 opacity-80" />

                      {/* header */}
                      <div className="mb-3 flex items-start gap-3">
                        <div className="relative">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-200 via-sky-200 to-purple-200 text-xs font-semibold text-slate-800 ring-1 ring-slate-100">
                            {service.name?.[0] || "?"}
                          </div>
                          {/* hover glow */}
                          <div className="pointer-events-none absolute -inset-2 -z-10 rounded-3xl bg-linear-to-br from-emerald-200/0 via-sky-200/0 to-purple-200/0 blur-md transition group-hover:from-emerald-200/55 group-hover:via-sky-200/45 group-hover:to-purple-200/55" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                              {service.name}
                            </h2>
                            {isVerified && (
                              <ShieldCheck className="h-4 w-4 text-emerald-500" />
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500">
                            {service.type} •{" "}
                            <span className="capitalize">{statusText.replaceAll("_", " ")}</span>
                          </div>
                        </div>
                      </div>

                      {/* description */}
                      <p className="mb-3 line-clamp-3 text-xs leading-relaxed text-slate-600">
                        {service.description || "No description available"}
                      </p>

                      {/* footer */}
                      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                              {score}
                            </span>
                            <span>Score</span>
                          </div>

                          {kycLevel > 0 && (
                            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200">
                              KYC {kycLevel}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap justify-end gap-1">
                          {tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-200"
                            >
                              {tag}
                            </span>
                          ))}

                          {tags.length > 2 && (
                            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-200">
                              +{tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}

              {results.length === 0 && (
                <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500">
                  No services match the current filters.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

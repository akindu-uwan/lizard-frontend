"use client";

import { useMemo, useState, useEffect } from "react";
import { ChevronDown, Search, ShieldCheck } from "lucide-react";
import { apiGet } from '@/app/lib/api';
import { Service } from '@/app/types/service';
import Link from "next/link";
import { useRouter } from "next/navigation";

type ServiceType = "Exchange" | "Aggregator" | "Tool" | "Host" | "Bridge";
type SortOption = "score_desc" | "score_asc" | "name_asc";

export default function DirectoryPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("score_desc");
  const [selectedTypes, setSelectedTypes] = useState<ServiceType[]>([]);
  const [showVerified, setShowVerified] = useState(true);

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

  const results = useMemo(() => {
    if (loading || error) return [];

    let list = services;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (service) =>
          service.name.toLowerCase().includes(term) ||
          service.description?.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (selectedTypes.length) {
      list = list.filter((service) => 
        selectedTypes.includes(service.type as ServiceType)
      );
    }

    // Verification filter - using verificationStatus instead of verified
    if (showVerified) {
      list = list.filter((service) => 
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

  const toggleType = (t: ServiceType) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  // Helper function to get display properties
  const getServiceDisplayProps = (service: Service) => {
    // Determine if service is verified based on verificationStatus
    const isVerified = service.verificationStatus === "verified" || 
                      service.verificationStatus === "approved";
    
    // Use trustScore as the main score, fallback to privacyScore or 0
    const score = service.trustScore || service.privacyScore || 0;
    
    // Use attributes as tags, fallback to empty array
    const tags = service.attributes || [];
    
    // Get KYC level, default to 0
    const kycLevel = service.kycLevel || 0;

    return { isVerified, score, tags, kycLevel };
  };

  return (
    <div className="flex flex-1 gap-6">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 rounded-3xl bg-white/70 p-4 shadow-md shadow-emerald-100/60 ring-1 ring-slate-100 md:block">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
          Filters
        </h2>

        {loading && (
          <div className="text-xs text-slate-500">Loading filters...</div>
        )}

        {error && (
          <div className="text-xs text-red-500">Error loading filters</div>
        )}

        {!loading && !error && (
          <>
            {/* Sort */}
            <div className="mb-4 space-y-1">
              <span className="text-xs font-medium text-slate-500">Sort by</span>
              <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 hover:bg-white">
                {sortBy === "score_desc" && "Score (High → Low)"}
                {sortBy === "score_asc" && "Score (Low → High)"}
                {sortBy === "name_asc" && "Name (A → Z)"}
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </button>
              <div className="flex flex-wrap gap-1 pt-1">
                <button
                  onClick={() => setSortBy("score_desc")}
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    sortBy === "score_desc"
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Score ↓
                </button>
                <button
                  onClick={() => setSortBy("score_asc")}
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    sortBy === "score_asc"
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Score ↑
                </button>
                <button
                  onClick={() => setSortBy("name_asc")}
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    sortBy === "name_asc"
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Name
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="mb-4 space-y-1">
              <span className="text-xs font-medium text-slate-500">Name</span>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-2">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-transparent px-2 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Type */}
            <div className="mb-4 space-y-1">
              <span className="text-xs font-medium text-slate-500">Type</span>
              <div className="space-y-1 text-xs text-slate-700">
                {(["Exchange", "Aggregator", "Tool", "Host", "Bridge"] as ServiceType[])
                  .map((t) => (
                    <label key={t} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                        checked={selectedTypes.includes(t)}
                        onChange={() => toggleType(t)}
                      />
                      <span>{t}</span>
                    </label>
                  ))}
              </div>
            </div>

            {/* Verification */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500">
                Verification
              </span>
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  className="h-3 w-3 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                  checked={showVerified}
                  onChange={(e) => setShowVerified(e.target.checked)}
                />
                <span>Verified</span>
              </label>
            </div>
          </>
        )}
      </aside>

      {/* Main list */}
      <section className="flex-1">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              Verified Services Directory
            </h1>
            <p className="text-xs text-slate-500">
              {loading ? "Loading..." : error ? "Error" : `${results.length} results`} • Powered by your backend
            </p>
          </div>

          <button className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-emerald-600 shadow-sm ring-1 ring-emerald-100 hover:bg-emerald-50">
            <Link href="/directory/add-service">
              + Add service
            </Link>
            
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center p-8 text-slate-500">Loading services...</div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center p-8 text-red-500">Error: {error}</div>
        )}

        {/* Results */}
        {!loading && !error && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map((service) => {
              const { isVerified, score, tags, kycLevel } = getServiceDisplayProps(service);
              
              return (
                <article
                  key={service._id}
                  className="flex flex-col rounded-3xl bg-white/90 p-4 shadow-md shadow-slate-200/70 ring-1 ring-slate-100"
                >
                  {/* header */}
                  <div className="mb-3 flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-200 via-sky-200 to-purple-200 text-xs font-semibold text-slate-800">
                      {service.name[0]}
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
                        {service.type} • {service.verificationStatus || "Not verified"}
                      </div>
                    </div>
                  </div>

                  {/* description */}
                  <p className="mb-3 line-clamp-3 text-xs leading-relaxed text-slate-600">
                    {service.description || "No description available"}
                  </p>

                  {/* badges */}
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-100">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                          {score}
                        </span>
                        <span>Score</span>
                      </div>
                      {kycLevel > 0 && (
                        <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-100">
                          KYC {kycLevel}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap justify-end gap-1">
                      {tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-100"
                        >
                          {tag}
                        </span>
                      ))}
                      {tags.length > 2 && (
                        <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-100">
                          +{tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {results.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-xs text-slate-500">
                No services match the current filters.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
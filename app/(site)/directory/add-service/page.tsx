"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, PlusCircle } from "lucide-react";
import Link from "next/link";
import { apiPost } from "@/app/lib/http";

type ServiceType = "exchange" | "wallet" | "vpn" | "hosting" | "other" | "aggregator" | "bridge" | "tool";

export default function AddServicePage() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<ServiceType>("exchange");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const [privacyScore, setPrivacyScore] = useState(0);
  const [trustScore, setTrustScore] = useState(0);
  const [kycLevel, setKycLevel] = useState(0);

  const [currencies, setCurrencies] = useState("");
  const [networks, setNetworks] = useState("");
  const [attributes, setAttributes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !slug || !url) {
      setError("Name, slug, and URL are required.");
      return;
    }

    const payload = {
      name,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      type,
      url,
      description: description || undefined,
      privacyScore,
      trustScore,
      kycLevel,
      currencies: currencies
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      networks: networks
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean),
      attributes: attributes
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
    };

    console.log("Submitting payload:", payload);

    try {
      setLoading(true);
      const createdService = await apiPost("/api/servicerequests", payload);
      setSuccess(`Service "${createdService.name}" created successfully!`);

      setTimeout(() => {
        router.push("/directory");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* breadcrumb / title row */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Directory
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            Add new service
          </h1>
          <p className="text-xs text-slate-500">
            Submit a new DEX, bridge or tool to appear in the directory.
          </p>
        </div>

        <Link
          href="/directory"
          className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
        >
          ← Back to directory
        </Link>
      </div>

      {/* Status messages */}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 ring-1 ring-emerald-200">
          {success}
        </div>
      )}

      {/* main form card */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-3xl rounded-[28px] bg-white/95 p-5 shadow-xl shadow-slate-200/80 ring-1 ring-slate-100 md:p-7"
      >
        {/* section: basic info */}
        <div className="mb-5 border-b border-slate-100 pb-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Basic information
          </h2>
          <p className="text-xs text-slate-500">
            We use this to display the card in the main directory.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Service name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Boltz Exchange"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Slug / ID *
            </label>
            <input
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="boltz-exchange"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <p className="text-[10px] text-slate-400">Used as unique identifier</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Type *
            </label>
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ServiceType)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                {/* Use lowercase values that match backend */}
                <option value="exchange">Exchange</option>
                <option value="wallet">Wallet</option>
                <option value="vpn">VPN</option>
                <option value="hosting">Hosting</option>
                <option value="aggregator">Aggregator</option>
                <option value="bridge">Bridge</option>
                <option value="tool">Tool</option>
                <option value="other">Other</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Website URL *
            </label>
            <input
              required
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
        </div>

        {/* Rest of your form remains the same... */}
        {/* section: description & details */}
        <div className="my-6 border-b border-slate-100 pb-4 pt-1">
          <h2 className="text-sm font-semibold text-slate-900">
            Description & details
          </h2>
          <p className="text-xs text-slate-500">
            Help users understand what this service does and how it works.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Full description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain how this service works, which assets it supports, and any unique privacy / security features."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Currencies
              </label>
              <input
                value={currencies}
                onChange={(e) => setCurrencies(e.target.value)}
                placeholder="BTC, XMR, ETH (comma separated)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Networks
              </label>
              <input
                value={networks}
                onChange={(e) => setNetworks(e.target.value)}
                placeholder="clearnet, onion, i2p (comma separated)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Attributes
              </label>
              <input
                value={attributes}
                onChange={(e) => setAttributes(e.target.value)}
                placeholder="non-custodial, no-kyc (comma separated)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* section: scores & compliance */}
        <div className="my-6 border-b border-slate-100 pb-4 pt-1">
          <h2 className="text-sm font-semibold text-slate-900">
            Scores & verification
          </h2>
          <p className="text-xs text-slate-500">
            These fields are used for scoring and filtering in the directory.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Privacy Score (0-10)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={privacyScore}
              onChange={(e) => setPrivacyScore(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Trust Score (0-10)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={trustScore}
              onChange={(e) => setTrustScore(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              KYC Level (0-4)
            </label>
            <input
              type="number"
              min="0"
              max="4"
              value={kycLevel}
              onChange={(e) => setKycLevel(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
        </div>

        {/* footer actions */}
        <div className="mt-7 flex flex-col-reverse items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500 md:flex-row">
          <p>
            By submitting, you confirm this service is non-custodial and you
            agree to the listing policy.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-200/80 hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <PlusCircle className="h-4 w-4" />
            {loading ? "Creating..." : "Submit service"}
          </button>
        </div>
      </form>
    </div>
  );
}
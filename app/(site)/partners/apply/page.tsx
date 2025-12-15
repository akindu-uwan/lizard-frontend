"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ShieldCheck,
  ExternalLink,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Clock,
  Mail,
  Cpu,
} from "lucide-react";
import { apiPost, apiGet } from "@/app/api/directory/route";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { cn } from "@/app/components/ui/cn";

type PartnerSignupFormValues = {
  projectName: string;
  companyName?: string;
  serviceType: "DEX" | "Aggregator" | "Bridge" | "Lending" | "Wallet" | "Other";
  primaryChain: string;
  supportedChains?: string;
  website: string;
  apiBaseUrl?: string;
  apiDocsUrl?: string;
  contactName: string;
  contactEmail: string;
  telegram?: string;
  discord?: string;
  estimatedDailyVolume?: string;
  notes?: string;
  acceptTerms: boolean;
};

type Partner = {
  _id: string;
  projectName: string;
  serviceType: string;
  primaryChain: string;
  website?: string;
  status: "pending" | "approved" | "rejected";
};

export default function PartnerApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(true);

  // UI-only: collapse advanced fields so it feels minimal
  const [showIntegration, setShowIntegration] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [showOps, setShowOps] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    watch,
  } = useForm<PartnerSignupFormValues>({
    defaultValues: {
      serviceType: "DEX",
      acceptTerms: false,
    },
  });

  // Live preview chips (small, minimal)
  const wProject = watch("projectName");
  const wType = watch("serviceType");
  const wChain = watch("primaryChain");

  // load approved partners preview
  useEffect(() => {
    async function fetchPartners() {
      try {
        setPartnersLoading(true);
        const data = await apiGet<Partner[]>("/api/partners?status=approved");
        setPartners(data);
      } catch (err) {
        console.error("Failed to load partners", err);
      } finally {
        setPartnersLoading(false);
      }
    }
    fetchPartners();
  }, []);

  const onSubmit = async (data: PartnerSignupFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitted(false);

    try {
      const SERVICE_MAP: Record<string, string> = {
        DEX: "DEX",
        AGGREGATOR: "Aggregator",
        BRIDGE: "Bridge",
        LENDING: "Lending",
        WALLET: "Wallet",
        OTHER: "Other",
      };

      const normalizedService =
        SERVICE_MAP[String(data.serviceType).trim().toUpperCase()] || data.serviceType;

      const payload = {
        ...data,
        serviceType: normalizedService,
        website: data.website.trim(),
        apiBaseUrl: data.apiBaseUrl?.trim() || "",
        apiDocsUrl: data.apiDocsUrl?.trim() || "",
        companyName: data.companyName?.trim() || "",
        supportedChains: data.supportedChains?.trim() || "",
        telegram: data.telegram?.trim() || "",
        discord: data.discord?.trim() || "",
        estimatedDailyVolume: data.estimatedDailyVolume?.trim() || "",
        notes: data.notes?.trim() || "",
      };

      await apiPost("/api/partnerrequests/apply", payload);

      setSubmitted(true);
      reset();
    } catch (err: any) {
      console.error(err);

      if (Array.isArray(err?.details)) {
        err.details.forEach((issue: any) => {
          const field = issue.path?.[0] as keyof PartnerSignupFormValues;
          if (!field) return;
          setError(field, {
            type: "server",
            message: issue.message || "Invalid value",
          });
        });
        setSubmitError("Please fix the highlighted fields.");
      } else {
        setSubmitError(
          err?.message || "Something went wrong while submitting your application."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const topPartners = useMemo(() => partners.slice(0, 5), [partners]);

  return (
    <div className="relative">
      {/* Lizard aura */}
      <div className="pointer-events-none absolute -top-24 left-0 h-64 w-64 rounded-full bg-emerald-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-purple-200/45 blur-3xl" />
      <div className="pointer-events-none absolute top-10 left-1/2 h-40 w-[720px] -translate-x-1/2 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="relative space-y-8">
        {/* heading */}
        <section className="space-y-2">
          <p className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-600">
            Partner Program
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            Get your protocol listed in our routes
          </h1>

          <p className="max-w-2xl text-sm text-slate-600">
            Share your protocol details so we can evaluate and integrate you as a routing
            source in Lizard.
          </p>

          {/* quick preview chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
              {wProject?.trim() ? wProject.trim() : "Your project"}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
              {wType || "Service type"}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
              {wChain?.trim() ? wChain.trim() : "Primary chain"}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
              Review: ~24–72h
            </span>
          </div>

          <div className="h-px w-full max-w-2xl bg-linear-to-r from-transparent via-slate-200 to-transparent" />
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1.25fr)]">
          {/* form */}
          <Card className="bg-white/90 overflow-hidden">
            {/* top accent */}
            <div className="px-6 md:px-8 pt-5">
              <div className="h-[3px] w-16 rounded-full bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 opacity-80" />
            </div>

            <div className="px-6 md:px-8 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Partner application
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Keep it accurate. We’ll contact you via email for integration steps.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-100">
                  Required fields <span className="ml-1 text-red-500">*</span>
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-6 md:px-8 py-6 space-y-6">
              {submitted && (
                <div className="p-3 text-sm rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                  Application submitted. We’ll review and get back to you via email.
                </div>
              )}

              {submitError && (
                <div className="p-3 text-sm rounded-2xl border border-red-200 bg-red-50 text-red-700">
                  {submitError}
                </div>
              )}

              {/* SECTION: Core info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    Core details
                  </h3>
                  <span className="text-[11px] text-slate-500">~2 min</span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1.5">
                      Project / Protocol name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("projectName", { required: "Required" })}
                      type="text"
                      className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                      placeholder="Example: SyncSwap"
                    />
                    {errors.projectName && (
                      <p className="mt-1 text-xs text-red-500">{errors.projectName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1.5">
                      Company / Entity (optional)
                    </label>
                    <input
                      {...register("companyName")}
                      type="text"
                      className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                      placeholder="Example: Sync Labs Ltd."
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1.5">
                      Service type <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("serviceType", { required: "Required" })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                    >
                      <option value="DEX">DEX</option>
                      <option value="Aggregator">Aggregator</option>
                      <option value="Bridge">Bridge</option>
                      <option value="Lending">Lending / Money Market</option>
                      <option value="Wallet">Wallet</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.serviceType && (
                      <p className="mt-1 text-xs text-red-500">{errors.serviceType.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1.5">
                      Primary chain <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("primaryChain", { required: "Required" })}
                      type="text"
                      className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                      placeholder="Example: Arbitrum, Ethereum"
                    />
                    {errors.primaryChain && (
                      <p className="mt-1 text-xs text-red-500">{errors.primaryChain.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1.5">
                    Website <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("website", {
                      required: "Required",
                      validate: (value) =>
                        /^https?:\/\/.+/i.test(value) ||
                        "Enter a valid URL (including http:// or https://)",
                    })}
                    type="url"
                    className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                    placeholder="https://example.com"
                  />
                  {errors.website && (
                    <p className="mt-1 text-xs text-red-500">{errors.website.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1.5">
                    Supported chains (optional)
                  </label>
                  <input
                    {...register("supportedChains")}
                    type="text"
                    className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                    placeholder="Comma-separated (e.g. Ethereum, Arbitrum, Polygon)"
                  />
                </div>
              </div>

              {/* Collapsible: Integration */}
              <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 ring-1 ring-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIntegration((v) => !v)}
                  className="flex w-full items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                      Integration (optional)
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      Helps routing setup faster (API base + docs).
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-slate-500 transition",
                      showIntegration && "rotate-180"
                    )}
                  />
                </button>

                {showIntegration && (
                  <div className="mt-4 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-800 mb-1.5">
                          API base URL (optional)
                        </label>
                        <input
                          {...register("apiBaseUrl", {
                            validate: (value) =>
                              !value ||
                              /^https?:\/\/.+/i.test(value) ||
                              "Enter a valid URL (including http:// or https://)",
                          })}
                          type="url"
                          className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                          placeholder="https://api.example.com"
                        />
                        {errors.apiBaseUrl && (
                          <p className="mt-1 text-xs text-red-500">{errors.apiBaseUrl.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-800 mb-1.5">
                          API docs URL (optional)
                        </label>
                        <input
                          {...register("apiDocsUrl", {
                            validate: (value) =>
                              !value ||
                              /^https?:\/\/.+/i.test(value) ||
                              "Enter a valid URL (including http:// or https://)",
                          })}
                          type="url"
                          className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                          placeholder="https://docs.example.com"
                        />
                        {errors.apiDocsUrl && (
                          <p className="mt-1 text-xs text-red-500">{errors.apiDocsUrl.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 ring-1 ring-slate-200">
                      Tip: Include any{" "}
                      <span className="font-semibold text-slate-700">quote/route endpoints</span>, fee
                      model, and rate limits in your docs.
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION: Contact */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Contact
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1.5">
                      Contact name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("contactName", { required: "Required" })}
                      type="text"
                      className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                      placeholder="Your name"
                    />
                    {errors.contactName && (
                      <p className="mt-1 text-xs text-red-500">{errors.contactName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1.5">
                      Contact email <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("contactEmail", {
                        required: "Required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Enter a valid email address",
                        },
                      })}
                      type="email"
                      className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                      placeholder="you@project.com"
                    />
                    {errors.contactEmail && (
                      <p className="mt-1 text-xs text-red-500">{errors.contactEmail.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Collapsible: Social */}
              <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 ring-1 ring-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSocial((v) => !v)}
                  className="flex w-full items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                      Social (optional)
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      Faster coordination for integration.
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-slate-500 transition",
                      showSocial && "rotate-180"
                    )}
                  />
                </button>

                {showSocial && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-1.5">
                        Telegram (optional)
                      </label>
                      <input
                        {...register("telegram")}
                        type="text"
                        className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                        placeholder="@handle"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-1.5">
                        Discord (optional)
                      </label>
                      <input
                        {...register("discord")}
                        type="text"
                        className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                        placeholder="username#0001 or invite"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsible: Ops */}
              <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 ring-1 ring-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOps((v) => !v)}
                  className="flex w-full items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                      Operations (optional)
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      Volume + routing notes for evaluation.
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-slate-500 transition",
                      showOps && "rotate-180"
                    )}
                  />
                </button>

                {showOps && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-1.5">
                        Estimated daily volume (optional)
                      </label>
                      <input
                        {...register("estimatedDailyVolume")}
                        type="text"
                        className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                        placeholder="e.g. 1–5M USD"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-1.5">
                        Notes (optional)
                      </label>
                      <textarea
                        {...register("notes")}
                        rows={3}
                        className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                        placeholder="Fees, special routing rules, limitations…"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* terms */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  {...register("acceptTerms", { required: "You must accept to submit" })}
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                />
                <p className="text-xs text-slate-600">
                  I confirm I’m an authorized representative, and the provided information is
                  accurate and may be used for due diligence and integration.
                </p>
              </div>
              {errors.acceptTerms && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.acceptTerms.message as string}
                </p>
              )}

              {/* actions */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5",
                    "bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 text-white",
                    "shadow-lg shadow-emerald-200/60 hover:brightness-110"
                  )}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Submitting…" : "Submit application"}
                </Button>

                <p className="text-[11px] text-slate-500">
                  We’ll reach out via email for technical details & integration tests.
                </p>
              </div>
            </form>
          </Card>

          {/* right side */}
          <div className="space-y-4">
            {/* pipeline card */}
            <Card className="p-5 bg-white/80">
              <div className="mb-4 h-[3px] w-16 rounded-full bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 opacity-80" />

              <h3 className="text-sm font-semibold text-slate-900">
                What happens after you apply
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Clear, predictable path to integration.
              </p>

              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
                    <Mail className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Review</div>
                    <div className="text-[11px] text-slate-500">
                      We verify public info + reach out for missing details.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-100">
                    <Cpu className="h-4 w-4 text-sky-700" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Integration</div>
                    <div className="text-[11px] text-slate-500">
                      We run routing tests, quoting, slippage + limits.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-purple-50 ring-1 ring-purple-100">
                    <CheckCircle2 className="h-4 w-4 text-purple-700" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Approved</div>
                    <div className="text-[11px] text-slate-500">
                      Your protocol becomes a routing source in Lizard.
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                    <Clock className="h-3.5 w-3.5" />
                    Typical review: 24–72h
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    Non-custodial routing
                  </span>
                </div>
              </div>
            </Card>

            {/* partner preview / list */}
            <Card className="p-5 bg-white/80">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Live routing partners
                </h3>
                {partners.length > 0 && (
                  <span className="text-[11px] text-slate-500">
                    {partners.length} integrated
                  </span>
                )}
              </div>

              {partnersLoading && <p className="text-xs text-slate-500">Loading partners…</p>}

              {!partnersLoading && partners.length === 0 && (
                <p className="text-xs text-slate-500">
                  Your protocol could be one of the first listed here.
                </p>
              )}

              {!partnersLoading && partners.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {topPartners.map((partner) => (
                    <li
                      key={partner._id}
                      className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2 text-xs ring-1 ring-slate-100"
                    >
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-slate-900">
                            {partner.projectName}
                          </span>
                          {partner.status === "approved" && (
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {partner.serviceType} • {partner.primaryChain}
                        </div>
                      </div>

                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Site
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

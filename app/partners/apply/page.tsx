"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ShieldCheck, ExternalLink } from "lucide-react";
import { apiPost, apiGet } from "@/app/api/directory/route";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<PartnerSignupFormValues>({
    defaultValues: {
      serviceType: "DEX",
      acceptTerms: false,
    },
  });

  // load approved partners preview (optional)
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
      const payload = {
        ...data,
        website: data.website.trim(),
        apiBaseUrl: data.apiBaseUrl?.trim() || undefined,
        apiDocsUrl: data.apiDocsUrl?.trim() || undefined,
      };

      await apiPost("/api/partners/apply", payload);

      setSubmitted(true);
      reset({
        projectName: "",
        companyName: "",
        serviceType: "DEX",
        primaryChain: "",
        supportedChains: "",
        website: "",
        apiBaseUrl: "",
        apiDocsUrl: "",
        contactName: "",
        contactEmail: "",
        telegram: "",
        discord: "",
        estimatedDailyVolume: "",
        notes: "",
        acceptTerms: false,
      });
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
          err?.message ||
            "Something went wrong while submitting your application."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* heading */}
      <section>
        <p className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-600">
          Partner Program
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
          Get your protocol listed in our routes
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Share your protocol details so we can evaluate and integrate you as a
          routing source in Lizard.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1.4fr)]">
        {/* form */}
        <Card className="bg-white/90">
          <div className="px-6 md:px-8 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Partner application
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Use official, verifiable details. We’ll contact you via email
                for integration steps.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-100">
                Required fields marked with{" "}
                <span className="ml-1 text-red-500">*</span>
              </span>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 md:px-8 py-6 space-y-6"
          >
            {submitted && (
              <div className="p-3 text-sm rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                Application submitted. We’ll review and get back to you via
                email.
              </div>
            )}

            {submitError && (
              <div className="p-3 text-sm rounded-2xl border border-red-200 bg-red-50 text-red-700">
                {submitError}
              </div>
            )}

            {/* project / company */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Project / Protocol name{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("projectName", { required: "Required" })}
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Example: SyncSwap"
                />
                {errors.projectName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.projectName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Company / Entity (optional)
                </label>
                <input
                  {...register("companyName")}
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Example: Sync Labs Ltd."
                />
              </div>
            </div>

            {/* type + primary chain */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Service type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("serviceType", { required: "Required" })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="DEX">DEX</option>
                  <option value="Aggregator">Aggregator</option>
                  <option value="Bridge">Bridge</option>
                  <option value="Lending">Lending / Money Market</option>
                  <option value="Wallet">Wallet</option>
                  <option value="Other">Other</option>
                </select>
                {errors.serviceType && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.serviceType.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Primary chain <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("primaryChain", { required: "Required" })}
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Example: Arbitrum, Ethereum"
                />
                {errors.primaryChain && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.primaryChain.message}
                  </p>
                )}
              </div>
            </div>

            {/* supported chains */}
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1.5">
                Supported chains (optional)
              </label>
              <input
                {...register("supportedChains")}
                type="text"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="List all chains you want us to route (comma-separated)"
              />
            </div>

            {/* URLs */}
            <div className="grid gap-4 md:grid-cols-2">
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
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="https://example.com"
                />
                {errors.website && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.website.message}
                  </p>
                )}
              </div>

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
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="https://api.example.com"
                />
                {errors.apiBaseUrl && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.apiBaseUrl.message}
                  </p>
                )}
              </div>
            </div>

            {/* api docs */}
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1.5">
                API documentation (optional)
              </label>
              <input
                {...register("apiDocsUrl", {
                  validate: (value) =>
                    !value ||
                    /^https?:\/\/.+/i.test(value) ||
                    "Enter a valid URL (including http:// or https://)",
                })}
                type="url"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="https://docs.example.com"
              />
              {errors.apiDocsUrl && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.apiDocsUrl.message}
                </p>
              )}
            </div>

            {/* contact */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Contact name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("contactName", { required: "Required" })}
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Your name"
                />
                {errors.contactName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.contactName.message}
                  </p>
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
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="you@project.com"
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.contactEmail.message}
                  </p>
                )}
              </div>
            </div>

            {/* socials */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Telegram (optional)
                </label>
                <input
                  {...register("telegram")}
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="username#0001 or server invite"
                />
              </div>
            </div>

            {/* volume + notes */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Estimated daily volume (optional)
                </label>
                <input
                  {...register("estimatedDailyVolume")}
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Anything we should know? Special routing rules, fee structure, etc."
                />
              </div>
            </div>

            {/* terms */}
            <div className="flex items-start gap-2 pt-2">
              <input
                {...register("acceptTerms", {
                  required: "You must accept to submit",
                })}
                type="checkbox"
                className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
              />
              <p className="text-xs text-slate-600">
                I confirm that I’m an authorized representative of this project,
                and that the provided information is accurate and may be used
                for due diligence and integration.
              </p>
            </div>
            {errors.acceptTerms && (
              <p className="mt-1 text-xs text-red-500">
                {errors.acceptTerms.message as string}
              </p>
            )}

            {/* actions */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full"
              >
                {isSubmitting ? "Submitting…" : "Submit application"}
              </Button>

              <p className="text-[11px] text-slate-500">
                We’ll reach out via email for technical details & integration
                tests.
              </p>
            </div>
          </form>
        </Card>

        {/* right side: partner preview / list */}
        <div className="space-y-4">
          <Card className="p-5 bg-white/80">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              How partners appear in Lizard
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Once approved, your protocol is included in our routing universe
              and may be highlighted in the directory or campaigns.
            </p>

            <div className="rounded-2xl bg-slate-50 p-3 flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-200 via-sky-200 to-purple-200 text-xs font-semibold text-slate-800">
                P
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-slate-900">
                    Partner DEX
                  </span>
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-[11px] text-slate-500 mb-1">
                  DEX • Arbitrum • Approved
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-600 ring-1 ring-emerald-100">
                    Routed source
                  </span>
                  <span className="rounded-full bg-slate-50 px-2 py-0.5 ring-1 ring-slate-100">
                    Featured
                  </span>
                </div>
              </div>
            </div>
          </Card>

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

            {partnersLoading && (
              <p className="text-xs text-slate-500">Loading partners…</p>
            )}

            {!partnersLoading && partners.length === 0 && (
              <p className="text-xs text-slate-500">
                Your protocol could be one of the first listed here.
              </p>
            )}

            {!partnersLoading && partners.length > 0 && (
              <ul className="mt-2 space-y-2">
                {partners.slice(0, 5).map((partner) => (
                  <li
                    key={partner._id}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-xs"
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
  );
}

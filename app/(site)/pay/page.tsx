"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Copy,
  Link as LinkIcon,
  Clock,
  ShieldCheck,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { cn } from "@/app/components/ui/cn";
import { apiPost } from "@/app/lib/http";

type PayLinkResponse = {
  id: string;
  slug: string;
  paymentUrl: string;
  payLink: {
    amountToReceive: number;
    receiveToken: string;
    receiveChain: string;
    receivingAddress: string;
    note?: string;
    expiresAt?: string | null;
  };
};

type PayRequestFormValues = {
  amountToReceive: string;
  receiveToken: string;
  receiveChain: string;
  receivingAddress: string;
  note?: string;
  expiresInMinutes?: string;
};

export default function LizardPayPage() {
  const [createdLink, setCreatedLink] = useState<PayLinkResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<PayRequestFormValues>({
    defaultValues: {
      receiveToken: "USDC",
      receiveChain: "Ethereum",
      expiresInMinutes: "30",
    },
  });

  const onSubmit = async (data: PayRequestFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setCreatedLink(null);
    setCopiedUrl(false);
    setCopiedAddress(false);

    try {
      const amountNum = Number(data.amountToReceive);
      if (isNaN(amountNum) || amountNum <= 0) {
        setError("amountToReceive", {
          type: "manual",
          message: "Enter a valid positive amount",
        });
        setSubmitError("Please fix the highlighted field.");
        setIsSubmitting(false);
        return;
      }

      const expiresMinutes = data.expiresInMinutes
        ? Number(data.expiresInMinutes)
        : undefined;

      const payload = {
        amountToReceive: amountNum,
        receiveToken: data.receiveToken.trim(),
        receiveChain: data.receiveChain.trim(),
        receivingAddress: data.receivingAddress.trim(),
        note: data.note?.trim() || undefined,
        expiresInMinutes:
          expiresMinutes && expiresMinutes > 0 ? expiresMinutes : undefined,
      };

        const resp = (await apiPost("/api/pay-links", payload)) as PayLinkResponse;

      setCreatedLink(resp);

      reset({
        amountToReceive: "",
        receiveToken: data.receiveToken,
        receiveChain: data.receiveChain,
        receivingAddress: data.receivingAddress,
        note: data.note || "",
        expiresInMinutes: data.expiresInMinutes,
      });
    } catch (err: any) {
      console.error(err);

      if (Array.isArray(err?.details)) {
        err.details.forEach((issue: any) => {
          const field = issue.path?.[0] as keyof PayRequestFormValues;
          if (!field) return;
          setError(field, {
            type: "server",
            message: issue.message || "Invalid value",
          });
        });
        setSubmitError("Please fix the highlighted fields.");
      } else {
        setSubmitError(
          err?.message || "Something went wrong while generating the link."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async (value: string, type: "url" | "address") => {
    try {
      await navigator.clipboard.writeText(value);
      if (type === "url") {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } else {
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
      }
    } catch (e) {
      console.error("Failed to copy", e);
    }
  };

  const expiresLabel =
    createdLink?.payLink.expiresAt &&
    new Date(createdLink.payLink.expiresAt).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="relative">
      {/* page aura like Swap/Directory */}
      <div className="pointer-events-none absolute -top-24 left-0 h-64 w-64 rounded-full bg-emerald-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-purple-200/45 blur-3xl" />
      <div className="pointer-events-none absolute top-12 left-1/2 h-40 w-[720px] -translate-x-1/2 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-6 md:px-8">
        {/* header */}
        <div className="mb-6 space-y-2">
          <p className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-600">
            Lizard Pay
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            Generate a payment link in seconds.
          </h1>

          <p className="max-w-2xl text-sm text-slate-600">
            Create a shareable link that tells a payer exactly what to send, on
            which chain, to which address — no custody, no friction.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
          {/* LEFT: Generator */}
          <Card className="relative overflow-hidden p-5 md:p-6">
            {/* subtle accent line */}
            <div className="mb-4 h-[3px] w-16 rounded-full bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 opacity-80" />

            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Create request
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Minimal setup. Advanced options are optional.
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200 md:flex">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Non-custodial
              </div>
            </div>

            {submitError && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("amountToReceive", { required: "Required" })}
                  type="text"
                  placeholder="250.00"
                  className={cn(
                    "mt-1 w-full rounded-2xl border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400",
                    "focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200",
                    errors.amountToReceive ? "border-red-300" : "border-slate-200"
                  )}
                />
                {errors.amountToReceive && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.amountToReceive.message}
                  </p>
                )}
              </div>

              {/* Token + Chain */}
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Token <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("receiveToken", { required: "Required" })}
                    type="text"
                    placeholder="USDC"
                    className={cn(
                      "mt-1 w-full rounded-2xl border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400",
                      "focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200",
                      errors.receiveToken ? "border-red-300" : "border-slate-200"
                    )}
                  />
                  {errors.receiveToken && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.receiveToken.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Chain <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("receiveChain", { required: "Required" })}
                    type="text"
                    placeholder="Ethereum"
                    className={cn(
                      "mt-1 w-full rounded-2xl border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400",
                      "focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200",
                      errors.receiveChain ? "border-red-300" : "border-slate-200"
                    )}
                  />
                  {errors.receiveChain && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.receiveChain.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Receiving address <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("receivingAddress", {
                    required: "Required",
                    minLength: { value: 10, message: "Address looks too short" },
                  })}
                  type="text"
                  placeholder="0x..."
                  className={cn(
                    "mt-1 w-full rounded-2xl border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400",
                    "font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200",
                    errors.receivingAddress ? "border-red-300" : "border-slate-200"
                  )}
                />
                {errors.receivingAddress && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.receivingAddress.message}
                  </p>
                )}
              </div>

              {/* Advanced toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-3.5 py-2.5 text-xs text-slate-700 ring-1 ring-slate-100 hover:bg-white"
              >
                <span className="flex items-center gap-2">
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition",
                      showAdvanced && "rotate-180"
                    )}
                  />
                  Advanced options (optional)
                </span>
                <span className="text-[11px] text-slate-500">
                  Note + expiry
                </span>
              </button>

              {showAdvanced && (
                <div className="space-y-3 rounded-3xl border border-slate-200 bg-white/70 p-4 ring-1 ring-slate-100">
                  <div>
                    <label className="block text-xs font-medium text-slate-700">
                      Note (optional)
                    </label>
                    <textarea
                      {...register("note")}
                      rows={3}
                      placeholder="Example: Invoice #123"
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700">
                      Expiry (minutes)
                    </label>
                    <input
                      {...register("expiresInMinutes")}
                      type="number"
                      min={1}
                      placeholder="30"
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      After expiry, the link appears inactive to payers.
                    </p>
                  </div>
                </div>
              )}

              {/* CTA */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full rounded-2xl",
                  "bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 text-white",
                  "shadow-lg shadow-emerald-200/60 hover:brightness-110"
                )}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isSubmitting ? "Generating…" : "Generate payment link"}
              </Button>

              <p className="text-center text-[11px] text-slate-500">
                Funds go directly to your address. Lizard never holds custody.
              </p>
            </form>
          </Card>

          {/* RIGHT: Result / Preview */}
          <Card className="p-5 md:p-6">
            <div className="mb-4 h-[3px] w-16 rounded-full bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 opacity-80" />

            <div className="mb-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Payment link
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Your payer can open the link or scan a QR.
              </p>
            </div>

            {!createdLink ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500">
                Generate a link to see the preview here.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary */}
                <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-500">Request</div>
                      <div className="mt-1 text-lg font-semibold text-slate-900">
                        {createdLink.payLink.amountToReceive}{" "}
                        {createdLink.payLink.receiveToken}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        on {createdLink.payLink.receiveChain}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {expiresLabel ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200">
                          <Clock className="h-3.5 w-3.5" />
                          Expires {expiresLabel}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200">
                          No expiry
                        </span>
                      )}
                    </div>
                  </div>

                  {createdLink.payLink.note && (
                    <p className="mt-3 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Note:</span>{" "}
                      {createdLink.payLink.note}
                    </p>
                  )}
                </div>

                {/* URL */}
                <div className="rounded-3xl bg-white/80 p-4 ring-1 ring-slate-200">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">
                      Shareable URL
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(createdLink.paymentUrl, "url")}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200 hover:bg-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copiedUrl ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-700 ring-1 ring-slate-200">
                    <LinkIcon className="h-4 w-4 text-slate-500" />
                    <span className="truncate">{createdLink.paymentUrl}</span>
                  </div>
                </div>

                {/* Address */}
                <div className="rounded-3xl bg-white/80 p-4 ring-1 ring-slate-200">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">
                      Receiving address
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(createdLink.payLink.receivingAddress, "address")
                      }
                      className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200 hover:bg-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copiedAddress ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-700 ring-1 ring-slate-200 font-mono break-all">
                    {createdLink.payLink.receivingAddress}
                  </div>
                </div>

                {/* QR placeholder */}
                <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 ring-1 ring-slate-100">
                  <div className="mb-2 text-xs font-medium text-slate-700">
                    QR code
                  </div>
                  <div className="flex items-center justify-center rounded-2xl bg-white p-6 ring-1 ring-slate-200">
                    <div className="text-center">
                      <div className="mx-auto mb-2 h-14 w-14 rounded-2xl bg-linear-to-br from-emerald-200 via-sky-200 to-purple-200" />
                      <div className="text-xs text-slate-600">
                        Plug QR later (paymentUrl)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Clean placeholder for now
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* subtle divider */}
        <div className="mt-6 h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent" />

        {/* tiny trust chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
            One link, any device
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
            Optional expiry
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
            Direct-to-wallet
          </span>
        </div>
      </div>
    </div>
  );
}

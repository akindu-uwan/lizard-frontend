"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { QrCode, Copy, Link as LinkIcon, Clock } from "lucide-react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { apiPost } from "@/app/lib/api";

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
        expiresInMinutes: expiresMinutes && expiresMinutes > 0 ? expiresMinutes : undefined,
      };

      const resp = await apiPost<PayLinkResponse>("/api/pay-links", payload);

      setCreatedLink(resp);

      reset({
        amountToReceive: "",
        receiveToken: data.receiveToken,
        receiveChain: data.receiveChain,
        receivingAddress: "",
        note: "",
        expiresInMinutes: data.expiresInMinutes,
      });
    } catch (err: any) {
      console.error(err);

      // If backend returns Zod-like issues array
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
    <div className="space-y-8">
      {/* Heading */}
      <section>
        <p className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-600">
          Lizard Pay
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
          Request a crypto payment
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Set the amount you want to receive, choose token and chain, and we’ll
          generate a one-time payment link you can share with anyone.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1.4fr)]">
        {/* Left: form */}
        <Card className="bg-white/90">
          <div className="px-6 md:px-8 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Payment link setup
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                These details define what your payer sees and how much they send.
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
            {submitError && (
              <div className="p-3 text-sm rounded-2xl border border-red-200 bg-red-50 text-red-700">
                {submitError}
              </div>
            )}

            {/* Amount + token */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Amount to receive <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("amountToReceive", { required: "Required" })}
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="250.00"
                />
                {errors.amountToReceive && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.amountToReceive.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Token to receive <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("receiveToken", { required: "Required" })}
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="USDC, USDT, DAI…"
                />
                {errors.receiveToken && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.receiveToken.message}
                  </p>
                )}
              </div>
            </div>

            {/* Chain + address */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Chain to receive on <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("receiveChain", { required: "Required" })}
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ethereum, Arbitrum, Polygon…"
                />
                {errors.receiveChain && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.receiveChain.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Receiving address <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("receivingAddress", {
                    required: "Required",
                    minLength: {
                      value: 10,
                      message: "Address looks too short",
                    },
                  })}
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                  placeholder="0x..."
                />
                {errors.receivingAddress && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.receivingAddress.message}
                  </p>
                )}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1.5">
                Note for payer (optional)
              </label>
              <textarea
                {...register("note")}
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Example: Payment for invoice #123, March 2025 subscription…"
              />
            </div>

            {/* Expiry */}
            <div className="grid gap-4 md:grid-cols-2 items-end">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Link expiry (minutes, optional)
                </label>
                <input
                  {...register("expiresInMinutes")}
                  type="number"
                  min={1}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="30"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  After expiry, the link will show as inactive to payers.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full"
              >
                {isSubmitting ? "Generating link…" : "Generate payment link"}
              </Button>

              <p className="text-[11px] text-slate-500">
                We’ll return a one-time link your users can open in any browser or
                wallet.
              </p>
            </div>
          </form>
        </Card>

        {/* Right: generated link + QR */}
        <div className="space-y-4">
          <Card className="p-5 bg-white/90">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Payment link
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Once generated, share this link with your customer. They’ll see a
              pay screen with amount, token, chain and QR code.
            </p>

            {!createdLink && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                Fill the form and click{" "}
                <span className="font-medium text-slate-700">
                  Generate payment link
                </span>{" "}
                to create a new pay link.
              </div>
            )}

            {createdLink && (
              <div className="space-y-4">
                {/* URL card */}
                <div className="rounded-2xl bg-slate-900 text-slate-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300">
                      Share this link
                    </span>
                    {expiresLabel && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-1 text-[11px] text-slate-200">
                        <Clock className="h-3 w-3" />
                        Expires {expiresLabel}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <code className="block max-w-full truncate rounded-xl bg-slate-800 px-3 py-2 text-[11px]">
                      {createdLink.paymentUrl}
                    </code>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1 bg-white/10 text-slate-50 ring-1 ring-slate-400 hover:bg-white/20"
                        onClick={() =>
                          handleCopy(createdLink.paymentUrl, "url")
                        }
                      >
                        <Copy className="h-3 w-3" />
                        {copiedUrl ? "Copied" : "Copy link"}
                      </Button>
                      <div className="text-[11px] text-slate-300 flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        Anyone with this link can see the payment request.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Receiving config + QR placeholder */}
                <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)]">
                  <div className="rounded-2xl bg-slate-50 p-3 flex flex-col gap-2">
                    <span className="text-[11px] font-medium text-slate-700">
                      You’ll receive
                    </span>
                    <div className="text-lg font-semibold text-slate-900">
                      {createdLink.payLink.amountToReceive.toLocaleString(
                        undefined,
                        { maximumFractionDigits: 6 }
                      )}{" "}
                      <span className="text-sm text-slate-500">
                        {createdLink.payLink.receiveToken}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      On{" "}
                      <span className="font-medium">
                        {createdLink.payLink.receiveChain}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1">
                      <span className="text-[11px] font-medium text-slate-700">
                        Receiving address
                      </span>
                      <code className="block max-w-full truncate rounded-xl bg-slate-900 px-3 py-2 text-[11px] text-emerald-100">
                        {createdLink.payLink.receivingAddress}
                      </code>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="mt-1 inline-flex items-center gap-1"
                        onClick={() =>
                          handleCopy(
                            createdLink.payLink.receivingAddress,
                            "address"
                          )
                        }
                      >
                        <Copy className="h-3 w-3" />
                        {copiedAddress ? "Copied" : "Copy address"}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-900/95 flex flex-col items-center justify-center gap-2 p-3 text-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-800">
                      {/* Placeholder for actual QR code */}
                      <QrCode className="h-12 w-12 text-emerald-300" />
                    </div>
                    <p className="text-[11px] text-slate-300">
                      On the payer page, this will be a real QR with amount +
                      address for their wallet.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* How it works */}
          <Card className="p-5 bg-white/80">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              How this maps to Houdini Pay
            </h3>
            <ol className="space-y-2 text-xs text-slate-600 list-decimal list-inside">
              <li>
                You set{" "}
                <span className="font-medium">
                  amount, token, chain and address
                </span>{" "}
                you want to receive.
              </li>
              <li>
                Backend creates a{" "}
                <span className="font-medium">payment link</span> with a unique
                ID and expiry.
              </li>
              <li>
                Your customer opens the link and sees a pay screen (we’ll build
                this at <code className="bg-slate-100 px-1 rounded">
                  /pay/[id]
                </code>{" "}
                next), where they send funds from any supported wallet.
              </li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}

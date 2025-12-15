"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { QrCode, Copy, Link as LinkIcon, Clock } from "lucide-react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { apiPost } from "@/app/api/directory/route";

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
        expiresInMinutes:
          expiresMinutes && expiresMinutes > 0 ? expiresMinutes : undefined,
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
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 lg:py-16">
      {/* 2-column layout like Houdini: left = hero text, right = widget card */}
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        {/* LEFT: marketing / explanation column */}
        <section className="space-y-6">
          <div>
            <p className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-600">
              Lizard Pay
            </p>
            <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
              Get paid in crypto with one link.
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-600">
              Generate a single payment link that encodes your amount,
              token, chain and address. Share it with anyone — they can
              pay you from any wallet or device.
            </p>
          </div>

          <div className="grid gap-4 text-sm text-slate-600">
            <div className="flex gap-3">
              <div className="mt-1 h-6 w-6 flex items-center justify-center rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-700">
                1
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Configure what you want to receive
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  Choose token, chain and your receiving address. Optionally
                  add a note and link expiry.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="mt-1 h-6 w-6 flex items-center justify-center rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-700">
                2
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Send your unique payment link
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  Copy the link and share it in email, chat or invoice.
                  Payers open it in any browser or wallet.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="mt-1 h-6 w-6 flex items-center justify-center rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-700">
                3
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Get paid directly to your wallet
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  Funds go straight to the address you specify. No custody,
                  no pooled accounts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: main widget card (form + preview in same card) */}
        <Card className="bg-white/95 shadow-sm">
          {/* Card header */}
          <div className="px-5 md:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Create payment request
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Define how much you want to receive and where, then we’ll
                generate a shareable link + QR.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-100">
                Required fields{" "}
                <span className="ml-1 text-red-500 font-semibold">*</span>
              </span>
            </div>
          </div>

          {/* Card body: 2-column widget layout inside */}
          <div className="px-5 md:px-6 py-5">
            <div className="space-y-4">
              {submitError && (
                <div className="p-3 text-sm rounded-2xl border border-red-200 bg-red-50 text-red-700">
                  {submitError}
                </div>
              )}

              {/* Inside the card: grid like Houdini – left form, right preview */}
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr),minmax(0,1.1fr)] items-start">
                {/* FORM COLUMN */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  {/* Amount + token */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-1.5">
                        Amount to receive{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("amountToReceive", {
                          required: "Required",
                        })}
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
                        Token to receive{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("receiveToken", {
                          required: "Required",
                        })}
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
                        Chain to receive on{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("receiveChain", {
                          required: "Required",
                        })}
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
                        Receiving address{" "}
                        <span className="text-red-500">*</span>
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

                  {/* CTA */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-full"
                    >
                      {isSubmitting ? "Generating link…" : "Generate payment link"}
                    </Button>
                    <p className="text-[11px] text-slate-500">
                      We&apos;ll return a one-time link your users can open in any
                      browser or wallet.
                    </p>
                  </div>
                </form>

    
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

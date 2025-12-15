"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { cn } from "@/app/components/ui/cn";
import {
  ArrowDownUp,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const CHAINS = ["Ethereum", "Arbitrum", "Polygon", "BSC", "Solana"] as const;

const TOKENS = [
  { symbol: "USDC", name: "USD Coin" },
  { symbol: "USDT", name: "Tether" },
  { symbol: "ETH", name: "Ether" },
  { symbol: "WBTC", name: "Wrapped Bitcoin" },
  { symbol: "MATIC", name: "Polygon" },
];

type Chain = (typeof CHAINS)[number];

export function SwapPanel() {
  const [fromAmount, setFromAmount] = useState<string>("");
  const [fromToken, setFromToken] = useState("USDC");
  const [fromChain, setFromChain] = useState<Chain>("Ethereum");

  const [toToken, setToToken] = useState("USDT");
  const [toChain, setToChain] = useState<Chain>("Ethereum");

  const [isRouting, setIsRouting] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const [estimatedOut, setEstimatedOut] = useState<number | null>(null);
  const [routeProviders, setRouteProviders] = useState<string[] | null>(null);
  const [priceImpact, setPriceImpact] = useState<number | null>(null);

  const canQuote =
    fromAmount.trim().length > 0 &&
    !isNaN(Number(fromAmount)) &&
    Number(fromAmount) > 0;

  const handleSwitchSides = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromChain(toChain);
    setToChain(fromChain);
    setEstimatedOut(null);
    setRouteProviders(null);
    setPriceImpact(null);
    setRouteError(null);
  };

  const handlePreviewRoute = async () => {
    if (!canQuote) return;

    setIsRouting(true);
    setRouteError(null);
    setEstimatedOut(null);
    setRouteProviders(null);
    setPriceImpact(null);

    try {
      const amountNum = Number(fromAmount);

      await new Promise((resolve) => setTimeout(resolve, 700));

      const mockRate = 0.995;
      const out = amountNum * mockRate;

      setEstimatedOut(out);
      setRouteProviders(["LizardRouter", "DexA", "DexB"]);
      setPriceImpact(0.03);
    } catch (err) {
      console.error(err);
      setRouteError("Failed to fetch route. Please try again.");
    } finally {
      setIsRouting(false);
    }
  };

  const status =
    isRouting ? "Searching…" : estimatedOut !== null ? "Route found" : "Not quoted";

  const statusBadgeClass =
    isRouting
      ? "bg-sky-50 text-sky-700 ring-sky-200"
      : estimatedOut !== null
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : "bg-slate-50 text-slate-600 ring-slate-200";

  return (
    <Card className="relative overflow-hidden p-4 md:p-6 lg:p-7">
      {/* Directional glow: left (emerald) → right (purple) */}
      <div className="pointer-events-none absolute -top-24 left-0 h-64 w-64 rounded-full bg-emerald-200/55 blur-3xl" />
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-purple-200/55 blur-3xl" />
      <div className="pointer-events-none absolute top-10 left-1/2 h-40 w-[520px] -translate-x-1/2 rounded-full bg-sky-200/35 blur-3xl" />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        {/* Left: swap box */}
        <div className="w-full max-w-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Swap
            </div>

            <div className="hidden items-center gap-2 text-xs text-slate-500 md:flex">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Non-custodial routing
            </div>
          </div>

          {/* From */}
          <div className="rounded-[22px] border border-slate-200 bg-white/90 p-4 shadow-sm ring-1 ring-slate-100">
            <div className="mb-3 h-[3px] w-16 rounded-full bg-linear-to-r from-emerald-400 via-sky-400 to-emerald-200" />

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>From</span>
              <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 ring-1 ring-slate-200">
                Balance: 0.00
              </span>
            </div>

            <div className="mt-3 flex items-end gap-3">
              <input
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                inputMode="decimal"
                className="flex-1 bg-transparent text-3xl font-semibold tracking-tight text-slate-900 placeholder:text-slate-300 focus:outline-none"
              />

              <div className="flex flex-col items-end gap-2">
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  {TOKENS.map((t) => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol}
                    </option>
                  ))}
                </select>

                <select
                  value={fromChain}
                  onChange={(e) => setFromChain(e.target.value as Chain)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  {CHAINS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Switch button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSwitchSides}
              className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              <span className="pointer-events-none absolute -inset-2 -z-10 rounded-full bg-linear-to-r from-emerald-200/0 via-sky-200/0 to-purple-200/0 blur-md transition group-hover:from-emerald-200/50 group-hover:via-sky-200/40 group-hover:to-purple-200/50" />
              <ArrowDownUp className="h-4 w-4 text-slate-700" />
            </button>
          </div>

          {/* To */}
          <div className="rounded-[22px] border border-slate-200 bg-white/90 p-4 shadow-sm ring-1 ring-slate-100">
            <div className="mb-3 h-[3px] w-16 rounded-full bg-linear-to-r from-purple-400 via-sky-400 to-purple-200" />

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>To (estimated)</span>
              <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 ring-1 ring-slate-200">
                Balance: 0.00
              </span>
            </div>

            <div className="mt-3 flex items-end gap-3">
              <div className="flex-1">
                <div className="text-3xl font-semibold tracking-tight text-slate-900">
                  {estimatedOut !== null
                    ? estimatedOut.toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                      })
                    : "--"}
                </div>

                <p className="mt-1 text-[11px] text-slate-500">
                  Approximate output after routing and fees.
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-200"
                >
                  {TOKENS.map((t) => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol}
                    </option>
                  ))}
                </select>

                <select
                  value={toChain}
                  onChange={(e) => setToChain(e.target.value as Chain)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-200"
                >
                  {CHAINS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* CTA + error */}
          <div className="space-y-2">
            <Button
              onClick={handlePreviewRoute}
              disabled={!canQuote || isRouting}
              className={cn(
                "w-full justify-center rounded-2xl",
                "bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 text-white",
                "shadow-lg shadow-emerald-200/60 hover:brightness-110"
              )}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isRouting ? "Searching best route…" : "Preview route"}
            </Button>

            {routeError && <p className="text-xs text-red-500">{routeError}</p>}

            <p className="text-[11px] text-slate-500">
              Preview shows estimated output and providers. Execution comes next.
            </p>
          </div>
        </div>

        {/* Right: route summary */}
        <div className="w-full max-w-xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Route summary
            </span>

            <button
              type="button"
              disabled={isRouting}
              onClick={handlePreviewRoute}
              className={cn(
                "inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50",
                !canQuote && "cursor-not-allowed opacity-40"
              )}
            >
              <RefreshCcw className="h-3 w-3" />
              Recalculate
            </button>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-white/90 p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Status</span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium ring-1",
                  statusBadgeClass
                )}
              >
                {status}
              </span>
            </div>

            <div className="mt-3 space-y-2 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Providers</span>
                <span className="text-slate-800">
                  {routeProviders ? routeProviders.join(" • ") : "—"}
                </span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Price impact</span>
                <span className="text-slate-800">
                  {priceImpact !== null ? `${priceImpact.toFixed(2)}%` : "—"}
                </span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Est. output</span>
                <span className="text-slate-800">
                  {estimatedOut !== null
                    ? `${estimatedOut.toFixed(4)} ${toToken}`
                    : "—"}
                </span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-500">
              Routes are simulated for now. Plug your quote API later.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

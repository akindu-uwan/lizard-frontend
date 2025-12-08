"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { cn } from "@/app/components/ui/cn";
import { ArrowDownUp, Info, RefreshCcw } from "lucide-react";

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
      setPriceImpact(0.03); // 0.03 %
    } catch (err) {
      console.error(err);
      setRouteError("Failed to fetch route. Please try again.");
    } finally {
      setIsRouting(false);
    }
  };

  return (
    <Card className="p-4 md:p-6 lg:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
        {/* Left: swap box */}
        <div className="w-full max-w-xl space-y-4">
          {/* From */}
          <div className="rounded-2xl bg-slate-900 text-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>From</span>
              <span>Balance: 0.00</span>
            </div>

            <div className="flex items-end gap-3">
              <input
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-transparent text-2xl md:text-3xl font-semibold text-slate-50 placeholder:text-slate-500 focus:outline-none"
              />
              <div className="flex flex-col items-end gap-2">
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-50 focus:outline-none"
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
                  className="rounded-xl bg-slate-800 px-3 py-1 text-[10px] text-slate-300 focus:outline-none"
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
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
            >
              <ArrowDownUp className="h-4 w-4" />
            </button>
          </div>

          {/* To */}
          <div className="rounded-2xl bg-slate-900 text-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>To (estimated)</span>
              <span>Balance: 0.00</span>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1">
                <div className="text-2xl md:text-3xl font-semibold text-slate-50">
                  {estimatedOut !== null
                    ? estimatedOut.toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                      })
                    : "--"}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  You’ll receive approximately this amount after routing and
                  fees.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-50 focus:outline-none"
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
                  className="rounded-xl bg-slate-800 px-3 py-1 text-[10px] text-slate-300 focus:outline-none"
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

          {/* CTA + small note */}
          <div className="space-y-2">
            <Button
              onClick={handlePreviewRoute}
              disabled={!canQuote || isRouting}
              className="w-full justify-center"
            >
              {isRouting ? "Searching best route…" : "Preview route"}
            </Button>
            
            {routeError && (
              <p className="text-xs text-red-500">{routeError}</p>
            )}
          </div>
        </div>

        {/* Right: route summary */}
        <div className="w-full max-w-xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
              Route summary
            </span>
            <button
              type="button"
              disabled={isRouting}
              onClick={handlePreviewRoute}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
                !canQuote && "opacity-40 cursor-not-allowed"
              )}
            >
              <RefreshCcw className="h-3 w-3" />
              Recalculate
            </button>
          </div>

          <div className="rounded-2xl bg-slate-900 text-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Route status</span>
              <span>
                {isRouting
                  ? "Searching…"
                  : estimatedOut !== null
                  ? "Route found"
                  : "Not quoted"}
              </span>
            </div>

            <div className="rounded-xl bg-slate-800/80 p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">Providers</span>
                <span className="text-slate-50">
                  {routeProviders
                    ? routeProviders.join(" • ")
                    : "—"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-300">Price impact</span>
                <span className="text-slate-50">
                  {priceImpact !== null ? `${priceImpact.toFixed(2)}%` : "—"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-300">Est. output</span>
                <span className="text-slate-50">
                  {estimatedOut !== null
                    ? `${estimatedOut.toFixed(4)} ${toToken}`
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

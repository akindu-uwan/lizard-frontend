import { SwapPanel } from "@/app/components/swap/SwapPanel";

export default function SwapPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-600">
          Swap
        </p>

        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
          Multi-route swaps, powered by Lizard
        </h1>

        <p className="max-w-2xl text-sm text-slate-600">
          Find the best route across aggregators and DEX liquidity. Minimal UI,
          maximum execution quality.
        </p>
      </section>

      <SwapPanel />

      {/* subtle divider (removes “empty” feeling, still minimal) */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent" />

      {/* trust chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
          Non-custodial routing
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
          Best-price quotes
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
          Transparent fees
        </span>
      </div>
    </div>
  );
}

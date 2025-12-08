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
        
      </section>

      <SwapPanel />
    </div>
  );
}

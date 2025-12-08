import { Card } from "@/app/components/ui/Card";

export default function TokenRequestPageShell() {
  return (
    <div className="space-y-6">
      <section>
        <p className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-600">
          Listings
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
          Request a token listing
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          We’ll embed your existing token request form here. Right now it’s just
          a placeholder so navigation is complete.
        </p>
      </section>

      <Card className="p-6 md:p-8 text-sm text-slate-600">
        Replace this with your full TokenRequestPage component when ready.
      </Card>
    </div>
  );
}

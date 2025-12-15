"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/components/ui/cn";
import { Button } from "@/app/components/ui/Button";

const navItems = [
  { label: "Swap", href: "/swap" },
  { label: "Directory", href: "/directory" },
  { label: "Lizard Pay", href: "/pay" },
  { label: "Partners", href: "/partners" },
  { label: "Token Request", href: "/tokens" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-6">
          <Link href="/swap" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 via-sky-400 to-purple-500 text-xs font-bold text-white">
              LZ
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              Lizard Exchange
            </span>
          </Link>

          <nav className="hidden items-center gap-2 text-xs md:flex">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-1.5 font-medium transition",
                    "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                    isActive &&
                      "bg-slate-900 text-slate-50 shadow-sm shadow-slate-300"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: network + connect wallet placeholder */}
        <div className="flex items-center gap-3">
          {/* <div className="hidden items-center gap-2 rounded-full bg-slate-900 text-xs text-slate-50 px-3 py-1.5 md:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Ethereum • Mainnet</span>
          </div> */}
          <Button size="sm" variant="secondary">
            Connect Wallet
          </Button>
        </div>
      </div>
    </header>
  );
}

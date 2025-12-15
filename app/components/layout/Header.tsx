"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/app/components/ui/cn";
import { Button } from "@/app/components/ui/Button";
import { keyAuthApi } from "@/app/lib/adminApi";

const navItems = [
  { label: "Swap", href: "/swap" },
  { label: "Directory", href: "/directory" },
  { label: "Lizard Pay", href: "/pay" },
  { label: "Partners", href: "/partners" },
  { label: "Token Request", href: "/tokens" },
];

type MeUser = { id: string; label?: string };

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<MeUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await keyAuthApi.me(); // { user: { id, label? } }
        if (mounted) setUser(res.user ?? null);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    try {
      await keyAuthApi.logout();
    } finally {
      setUser(null);
      router.refresh();
      router.push("/");
    }
  }

  const shortId = user?.id ? `${user.id.slice(0, 6)}…${user.id.slice(-4)}` : "";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur supports-backdrop-filter:bg-white/60">
      {/* subtle brand line */}
      <div className="h-0.5 w-full bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 opacity-70" />

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-6">
          <Link href="/swap" className="group flex items-center gap-2">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 via-sky-400 to-purple-500 text-xs font-bold text-white shadow-sm shadow-emerald-200/60">
                LZ
              </div>
              <div className="pointer-events-none absolute -inset-2 -z-10 rounded-3xl bg-linear-to-br from-emerald-200/0 via-sky-200/0 to-purple-200/0 blur-md transition group-hover:from-emerald-200/50 group-hover:via-sky-200/40 group-hover:to-purple-200/50" />
            </div>

            <span className="text-sm font-semibold tracking-tight text-slate-900">
              Lizard Exchange
            </span>
          </Link>

          <nav className="relative hidden items-center gap-1 text-xs md:flex">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-3 py-1.5 text-xs font-medium transition",
                    "text-slate-600 hover:text-slate-900",
                    "hover:bg-slate-100/70",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200",
                    isActive && "text-slate-900"
                  )}
                >
                  {/* gradient underline when active */}
                  {isActive && (
                    <span className="absolute left-3 right-3 -bottom-1.5 h-0.5 rounded-full bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500" />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: auth + connect wallet */}
        <div className="flex items-center gap-3">
          {!authLoading && !user && (
            <>
              <Link href="/login">
                <Button size="sm" variant="ghost">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" variant="secondary">
                  Sign up
                </Button>
              </Link>
            </>
          )}

          {!authLoading && user && (
            <>
              <div className="hidden items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs text-slate-700 shadow-sm md:flex">
                {user.label?.trim() ? user.label : shortId}
              </div>

              <Button size="sm" variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}

          {/* main CTA */}
          <Button
            size="sm"
            className="rounded-2xl bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 text-white shadow-lg shadow-emerald-200/60 hover:brightness-110 active:brightness-105"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    </header>
  );
}

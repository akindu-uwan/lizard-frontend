"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/app/lib/adminApi";
import {
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Layers,
  Coins,
  Handshake,
  Settings,
  Sparkles,
} from "lucide-react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

interface AdminStatus {
  isAuthenticated: boolean;
  email?: string;
  // ✅ derived client-side (your backend doesn't return it)
  isAdmin?: boolean;
}

function initials(email?: string) {
  if (!email) return "AD";
  const name = email.split("@")[0] || "admin";
  const parts = name.split(/[.\-_]/g).filter(Boolean);
  const a = (parts[0]?.[0] || name[0] || "A").toUpperCase();
  const b = (parts[1]?.[0] || name[1] || "D").toUpperCase();
  return `${a}${b}`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminStatus, setAdminStatus] = useState<AdminStatus>({
    isAuthenticated: false,
    email: "",
    isAdmin: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authApi.checkStatus();

      // ✅ Always normalize to an object (never allow undefined/null)
      const data = (response?.data ?? {}) as Partial<AdminStatus>;
      const isAuthenticated = !!data.isAuthenticated;
      const email = typeof data.email === "string" ? data.email : "";

      // ✅ derive isAdmin from session-auth status (no backend change needed)
      const nextStatus: AdminStatus = {
        isAuthenticated,
        email,
        isAdmin: isAuthenticated,
      };

      setAdminStatus(nextStatus);

      // ✅ if not authenticated, redirect now
      if (!isAuthenticated) {
        router.push(`/admin/login?redirect=${encodeURIComponent("/admin")}`);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAdminStatus({ isAuthenticated: false, email: "", isAdmin: false });
      router.push(`/admin/login?redirect=${encodeURIComponent("/admin")}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      router.push("/admin/login");
    }
  };

  const email = adminStatus?.email || "";
  const adminBadge = useMemo(() => {
    if (!email) return "Admin Session";
    return email.length > 26 ? `${email.slice(0, 24)}…` : email;
  }, [email]);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-slate-50">
        <div className="pointer-events-none absolute -top-20 left-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />

        <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
          <div className="rounded-[28px] bg-white/85 p-6 ring-1 ring-slate-100 shadow-xl shadow-slate-200/60">
            <div className="h-[3px] w-16 rounded-full bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 opacity-80" />
            <div className="mt-5 animate-pulse space-y-3">
              <div className="h-7 w-60 rounded bg-slate-100" />
              <div className="h-4 w-[520px] max-w-full rounded bg-slate-100" />
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <div className="h-24 rounded-3xl bg-slate-100" />
                <div className="h-24 rounded-3xl bg-slate-100" />
                <div className="h-24 rounded-3xl bg-slate-100" />
              </div>
              <div className="h-52 rounded-3xl bg-slate-100" />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600">Loading admin console…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* Aura background */}
      <div className="pointer-events-none absolute -top-24 left-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-24 left-1/2 h-40 w-[780px] -translate-x-1/2 rounded-full bg-sky-200/25 blur-3xl" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 via-sky-400 to-purple-500 text-xs font-bold text-white shadow-sm">
              {initials(email)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold tracking-tight text-slate-900">
                  Lizard Admin
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-emerald-700">
                  <ShieldCheck className="h-3 w-3" />
                  Secure
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{adminBadge}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        {/* Hero / intro */}
        <section className="rounded-[28px] bg-white/85 p-6 ring-1 ring-slate-100 shadow-xl shadow-slate-200/60">
          <div className="h-[3px] w-16 rounded-full bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 opacity-80" />

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-600">
                <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" />
                Dashboard
              </p>
              <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                Admin Console
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Review directory requests, token listings, and partner applications — fast,
                clean, and consistent with the Lizard theme.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                Session active
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                {adminStatus?.isAuthenticated ? "Authenticated" : "Not authenticated"}
              </div>
            </div>
          </div>

          {/* KPI strip (UI only) */}
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  Directory Requests
                </span>
                <Layers className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">—</div>
              <p className="mt-1 text-[11px] text-slate-500">
                Review services submitted by users
              </p>
            </div>

            <div className="rounded-3xl bg-sky-50/70 p-4 ring-1 ring-sky-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-sky-700">
                  Token Listings
                </span>
                <Coins className="h-4 w-4 text-sky-600" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">—</div>
              <p className="mt-1 text-[11px] text-sky-700/80">
                Approve / reject token requests
              </p>
            </div>

            <div className="rounded-3xl bg-emerald-50/60 p-4 ring-1 ring-emerald-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700">
                  Partner Applications
                </span>
                <Handshake className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">—</div>
              <p className="mt-1 text-[11px] text-emerald-700/80">
                Routing partner onboarding requests
              </p>
            </div>
          </div>
        </section>

        {/* Main actions */}
        <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Services */}
          <Card className="group relative overflow-hidden bg-white/90 p-5 ring-1 ring-slate-100">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 opacity-60" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  <Layers className="h-3.5 w-3.5" />
                  Directory
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-900">
                  Service Requests
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Review and verify services submitted to your directory.
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-200 via-sky-200 to-purple-200 text-slate-800 ring-1 ring-slate-100">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-[11px] text-slate-500">
                Tip: Use quick status updates inside the list.
              </p>
              <button
                onClick={() => router.push("/admin/services")}
                className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-95"
              >
                Open <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </Card>

          {/* Tokens */}
          <Card className="group relative overflow-hidden bg-white/90 p-5 ring-1 ring-slate-100">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-sky-400 via-emerald-400 to-purple-500 opacity-60" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-100">
                  <Coins className="h-3.5 w-3.5" />
                  Tokens
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-900">
                  Token Requests
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Approve listings and keep token data clean & consistent.
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-200 via-sky-200 to-purple-200 text-slate-800 ring-1 ring-slate-100">
                <Coins className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-[11px] text-slate-500">
                Tip: Validate contract + chain before approval.
              </p>
              <button
                onClick={() => router.push("/admin/tokens")}
                className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-95"
              >
                Open <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </Card>

          {/* Partners */}
          <Card className="group relative overflow-hidden bg-white/90 p-5 ring-1 ring-slate-100">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-purple-500 via-sky-400 to-emerald-400 opacity-60" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  <Handshake className="h-3.5 w-3.5" />
                  Partners
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-900">
                  Partner Applications
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Review partner submissions and integration readiness.
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-200 via-sky-200 to-purple-200 text-slate-800 ring-1 ring-slate-100">
                <Handshake className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-[11px] text-slate-500">
                Tip: Ensure website + docs URLs are valid.
              </p>
              <button
                onClick={() => router.push("/admin/partners")}
                className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-95"
              >
                Open <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </Card>

          {/* Settings (Coming soon) */}
          <Card className="relative overflow-hidden bg-white/70 p-5 ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-100">
                  <Settings className="h-3.5 w-3.5" />
                  System
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-900">
                  System Settings
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Maintenance mode, admin users, and config options.
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 ring-1 ring-slate-200">
                <Settings className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-[11px] text-slate-500">Not enabled yet.</p>
              <Button size="sm" className="rounded-full px-4" disabled>
                Coming soon
              </Button>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <div className="mt-8 text-center text-[11px] text-slate-500">
          Restricted area • Authorized personnel only • Lizard Exchange Admin
        </div>
      </main>
    </div>
  );
}

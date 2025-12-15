"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { authApi } from "@/app/lib/adminApi";

import {
  AlertTriangle,
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

type LoginForm = {
  email: string;
  password: string;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const email = watch("email");
  const emailHint = useMemo(() => {
    const v = (email || "").trim();
    if (!v) return "Use your admin account email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Looks like an invalid email format";
    return "Email format looks good";
  }, [email]);

  // ✅ changed: now uses authApi.login(email, password)
  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await authApi.login(data.email, data.password);
      router.push(redirectTo);
    } catch (error: any) {
      setSubmitError(
        error?.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Lizard aura background */}
      <div className="pointer-events-none absolute -top-24 left-0 h-64 w-64 rounded-full bg-emerald-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-purple-200/45 blur-3xl" />
      <div className="pointer-events-none absolute top-16 left-1/2 h-40 w-[720px] -translate-x-1/2 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />

      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)] lg:items-center">
          {/* Left: brand / message */}
          <div className="hidden lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Restricted Area
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
              Lizard Admin Console
            </h1>
            <p className="mt-3 max-w-lg text-sm text-slate-600">
              Manage listings, verify services, and review submissions in one place.
              This area is limited to authorized personnel only.
            </p>

            <div className="mt-6 grid max-w-lg gap-3">
              <div className="rounded-3xl bg-white/70 p-4 ring-1 ring-slate-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-200 via-sky-200 to-purple-200 text-slate-800 ring-1 ring-slate-100">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Fast verification workflows
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Approve, verify, or mark community-reviewed in a clean dashboard UI.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white/70 p-4 ring-1 ring-slate-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-200 via-sky-200 to-purple-200 text-slate-800 ring-1 ring-slate-100">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Secure access
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Keep admin access separated from public pages with strict sign-in.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: login card */}
          <div className="w-full">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-6 text-center lg:hidden">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 via-sky-400 to-purple-500 text-xs font-bold text-white">
                  LZ
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Lizard Admin
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Sign in to access the dashboard
                </p>
              </div>

              <div className="relative overflow-hidden rounded-[28px] bg-white/90 p-6 ring-1 ring-slate-100 shadow-xl shadow-slate-200/70">
                <div className="absolute inset-x-0 top-0 h-[3px] bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 opacity-80" />

                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Admin Sign In
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">
                    Welcome back
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Enter your credentials to continue.
                  </p>
                </div>

                {submitError && (
                  <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4" />
                      <span>{submitError}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-200">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <input
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
                            message: "Invalid email address",
                          },
                        })}
                        type="email"
                        className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                        placeholder="admin@lizard.exchange"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">{emailHint}</p>
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-200">
                      <Lock className="h-4 w-4 text-slate-400" />
                      <input
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters",
                          },
                        })}
                        type={showPw ? "text" : "password"}
                        className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="rounded-xl p-1 text-slate-500 hover:bg-slate-100"
                        aria-label={showPw ? "Hide password" : "Show password"}
                      >
                        {showPw ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-400 via-sky-400 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 hover:brightness-110 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {isSubmitting ? "Signing in…" : "Sign in"}
                  </button>

                  <p className="pt-1 text-center text-[11px] text-slate-500">
                    This is a restricted area. Unauthorized access is prohibited.
                  </p>
                </form>
              </div>

              <div className="mt-6 text-center">
                <p className="text-[11px] text-slate-400">
                  © {new Date().getFullYear()} Lizard Exchange
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

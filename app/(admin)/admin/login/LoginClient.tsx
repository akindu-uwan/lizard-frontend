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

export default function LoginClient() {
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
  } = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = async (data: LoginForm) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      
        await authApi.login(data.email, data.password);
      router.push(redirectTo);
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const pwType = useMemo(() => (showPw ? "text" : "password"), [showPw]);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
          </div>

          <div className="relative p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Admin Access
                </p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                  Sign in
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Enter your admin credentials to continue.
                </p>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
            </div>

            {submitError && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
                <div className="leading-snug">{submitError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 bg-white px-10 py-2.5 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                    placeholder="admin@lizard.exchange"
                    {...register("email", { required: "Email is required" })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={pwType}
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 bg-white px-10 py-2.5 pr-11 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                    placeholder="••••••••"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 4, message: "Too short" },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
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
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>

              <p className="pt-2 text-center text-xs text-slate-500">
                You will be redirected to{" "}
                <span className="font-medium text-slate-700">{redirectTo}</span>
              </p>
            </form>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Lizard Exchange • Admin Panel
        </p>
      </div>
    </div>
  );
}

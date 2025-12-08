import { ButtonHTMLAttributes } from "react";
import { cn } from "@/app/components/ui/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1";
  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      "bg-emerald-500 text-white shadow-sm shadow-emerald-200 hover:bg-emerald-600 focus:ring-emerald-500",
    secondary:
      "bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50 focus:ring-slate-300",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-300",
  };
  const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };

  return (
    <button
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}

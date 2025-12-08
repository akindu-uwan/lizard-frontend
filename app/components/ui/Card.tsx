import { ReactNode } from "react";
import { cn } from "@/app/components/ui/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white/90 border border-slate-100 rounded-3xl shadow-md shadow-emerald-100/60 ring-1 ring-slate-100",
        className
      )}
    >
      {children}
    </div>
  );
}

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "secondary", size = "md", ...props },
  ref,
) {
  const variants = {
    primary:
      "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/10 hover:bg-cyan-300",
    secondary:
      "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/[0.09] dark:hover:border-white/20",
    ghost:
      "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white",
    danger:
      "border border-rose-400/20 bg-rose-400/10 text-rose-600 hover:bg-rose-400/15 dark:text-rose-300",
  };

  const sizes = {
    sm: "h-8 gap-2 px-3 text-xs",
    md: "h-10 gap-2 px-4 text-sm",
    icon: "h-10 w-10",
  };

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-[.98] disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});

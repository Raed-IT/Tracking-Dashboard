import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" | "icon" };
export const Button = forwardRef<HTMLButtonElement, Props>(function Button({ className, variant = "secondary", size = "md", ...props }, ref) {
  return <button ref={ref} className={cn("ui-button", `ui-button--${variant}`, `ui-button--${size}`, className)} {...props} />;
});

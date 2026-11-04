import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Icon } from "./icons";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "light" | "outline-light";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,color,box-shadow,transform] duration-200 ease-[var(--ease-brand)] focus-visible:outline-3 disabled:opacity-60 disabled:pointer-events-none select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-brand-green text-white hover:bg-[#176a37] shadow-[0_6px_18px_-8px_rgb(29_128_67/0.7)] active:translate-y-px",
  secondary: "bg-brand-yellow text-brand-navy hover:bg-[#e8bb00] shadow-[0_6px_18px_-8px_rgb(249_201_0/0.8)] active:translate-y-px",
  outline: "border-2 border-brand-navy/15 text-brand-navy hover:border-brand-green hover:text-brand-green bg-white",
  ghost: "text-brand-blue hover:text-brand-green px-0!",
  light: "bg-white text-brand-navy hover:bg-mist",
  "outline-light": "border-2 border-white/40 text-white hover:border-brand-yellow hover:text-brand-yellow",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

type LinkButtonProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  size?: Size;
  className?: string;
  arrow?: boolean;
  children: ReactNode;
};

export function LinkButton({ variant = "primary", size = "md", className = "", arrow, children, ...props }: LinkButtonProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
      {arrow ? <Icon.Arrow className="size-4.5" /> : null}
    </Link>
  );
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };
export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

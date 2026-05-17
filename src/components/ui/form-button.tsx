import { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function FormButton({
  children,
  className,
  type = "button",
  ...props
}: FormButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "h-12 w-full rounded-xl text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

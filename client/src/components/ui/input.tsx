import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-black/10 bg-white px-3 text-sm text-[var(--text)] shadow-sm outline-none placeholder:text-black/35 focus-visible:ring-2 focus-visible:ring-[var(--secondary)]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };

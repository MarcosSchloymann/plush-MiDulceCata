import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-[var(--text)] shadow-sm outline-none placeholder:text-black/35 focus-visible:ring-2 focus-visible:ring-[var(--secondary)]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };

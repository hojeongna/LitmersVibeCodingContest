"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const aiButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default:
          "btn-ai text-white shadow-md hover:shadow-lg",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary/10",
        ghost:
          "bg-transparent text-primary hover:bg-primary/10",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs",
        lg: "h-10 rounded-md px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function AIButton({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  showIcon = true,
  children,
  disabled,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof aiButtonVariants> & {
    asChild?: boolean;
    loading?: boolean;
    showIcon?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(aiButtonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" />
          <span>분석 중...</span>
        </>
      ) : (
        <>
          {showIcon && <Sparkles className="h-4 w-4" />}
          {children}
        </>
      )}
    </Comp>
  );
}

export { AIButton, aiButtonVariants };

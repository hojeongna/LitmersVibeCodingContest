import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const priorityBadgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      priority: {
        HIGH: "bg-priority-high-bg text-priority-high-text",
        MEDIUM: "bg-priority-medium-bg text-priority-medium-text",
        LOW: "bg-priority-low-bg text-priority-low-text",
      },
    },
    defaultVariants: {
      priority: "MEDIUM",
    },
  }
);

export type Priority = "HIGH" | "MEDIUM" | "LOW";

interface PriorityBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof priorityBadgeVariants> {
  priority: Priority;
}

const priorityLabels: Record<Priority, string> = {
  HIGH: "높음",
  MEDIUM: "보통",
  LOW: "낮음",
};

function PriorityBadge({
  className,
  priority,
  ...props
}: PriorityBadgeProps) {
  return (
    <span
      className={cn(priorityBadgeVariants({ priority, className }))}
      {...props}
    >
      {priorityLabels[priority]}
    </span>
  );
}

export { PriorityBadge, priorityBadgeVariants };

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const labelTagVariants = cva(
  "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      preset: {
        bug: "bg-label-bug-bg text-label-bug-text",
        feature: "bg-label-feature-bg text-label-feature-text",
        enhancement: "bg-label-enhancement-bg text-label-enhancement-text",
        docs: "bg-label-docs-bg text-label-docs-text",
        custom: "", // Custom color will be applied via style prop
      },
    },
    defaultVariants: {
      preset: "custom",
    },
  }
);

export type LabelPreset = "bug" | "feature" | "enhancement" | "docs" | "custom";

interface LabelTagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof labelTagVariants> {
  /** Label name to display */
  label: string;
  /** Preset color theme */
  preset?: LabelPreset;
  /** Custom background color (hex) - only used when preset is "custom" */
  bgColor?: string;
  /** Custom text color (hex) - only used when preset is "custom" */
  textColor?: string;
  /** Whether the label can be removed */
  removable?: boolean;
  /** Called when remove button is clicked */
  onRemove?: () => void;
}

function LabelTag({
  className,
  label,
  preset = "custom",
  bgColor,
  textColor,
  removable = false,
  onRemove,
  style,
  ...props
}: LabelTagProps) {
  const customStyle =
    preset === "custom" && (bgColor || textColor)
      ? {
          ...style,
          backgroundColor: bgColor,
          color: textColor,
        }
      : style;

  return (
    <span
      className={cn(labelTagVariants({ preset, className }))}
      style={customStyle}
      {...props}
    >
      {label}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 rounded-sm p-0.5 hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-current"
          aria-label={`${label} 라벨 제거`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

export { LabelTag, labelTagVariants };

"use client";

import { getPasswordStrength, strengthLabels, strengthColors, type PasswordStrength } from "@/lib/utils/password-strength";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const strength = getPasswordStrength(password);

  const getBarCount = (s: PasswordStrength): number => {
    switch (s) {
      case "weak": return 1;
      case "medium": return 2;
      case "strong": return 3;
    }
  };

  const barCount = getBarCount(strength);
  const color = strengthColors[strength];

  if (!password) return null;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{
              backgroundColor: i <= barCount ? color : "#E4E4E7",
            }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color }}>
        비밀번호 강도: {strengthLabels[strength]}
      </p>
    </div>
  );
}

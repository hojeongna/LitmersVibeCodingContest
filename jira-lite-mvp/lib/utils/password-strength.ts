export type PasswordStrength = "weak" | "medium" | "strong";

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 6) return "weak";

  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);

  const score = [hasNumber, hasSpecial, hasUpperCase, hasLowerCase].filter(Boolean).length;

  if (score >= 3 && password.length >= 8) return "strong";
  if (password.length >= 6) return "medium";
  return "weak";
}

export const strengthLabels: Record<PasswordStrength, string> = {
  weak: "약함",
  medium: "보통",
  strong: "강함",
};

export const strengthColors: Record<PasswordStrength, string> = {
  weak: "#EF4444",    // Red
  medium: "#F59E0B",  // Amber
  strong: "#22C55E",  // Green
};

import { CheckCircle2 } from "lucide-react";

const features = [
  "AI 자동 요약으로 이슈를 빠르게 파악",
  "직관적인 칸반 보드로 작업 관리",
  "실시간 팀 협업 지원",
  "중복 이슈 자동 탐지",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Brand Section - Left */}
      <div
        className="hidden lg:flex lg:flex-1 flex-col justify-center px-12 text-white"
        style={{
          backgroundImage: "url('/login-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#5B5FC7]/90 to-[#3B82F6]/90 mix-blend-multiply" />
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="relative w-10 h-10">
              <img src="/logo.png" alt="Litmers" className="w-full h-full object-contain brightness-0 invert" />
            </div>
            <h1 className="text-2xl font-bold">Litmers</h1>
          </div>

          <h2 className="text-3xl font-bold mb-4">
            AI가 함께하는
            <br />
            스마트한 이슈 관리
          </h2>

          <p className="text-white/80 mb-8">
            팀이 더 빠르게 이슈를 관리하고 해결할 수 있게 해주는
            AI 기반 경량 이슈 트래킹 도구입니다.
          </p>

          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-white/90 flex-shrink-0" />
                <span className="text-white/90">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form Section - Right */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="relative w-8 h-8">
              <img src="/logo.png" alt="Litmers" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold">Litmers</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

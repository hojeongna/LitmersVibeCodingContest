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
          background: "linear-gradient(135deg, #5B5FC7 0%, #3B82F6 100%)",
        }}
      >
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-xl font-bold">J</span>
            </div>
            <h1 className="text-2xl font-bold">Jira Lite</h1>
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
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg, #5B5FC7 0%, #3B82F6 100%)" }}
            >
              <span className="text-lg font-bold">J</span>
            </div>
            <span className="text-xl font-bold">Jira Lite</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

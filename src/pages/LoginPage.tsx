import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const MARQUEE_ROWS = [
  { dir: 1,  duration: 14 },
  { dir: -1, duration: 18 },
  { dir: 1,  duration: 12 },
  { dir: -1, duration: 16 },
  { dir: 1,  duration: 20 },
];

function MarqueeRow({ dir, duration }: { dir: number; duration: number }) {
  const text = "IGNOA · IGNOA · IGNOA · IGNOA · IGNOA · IGNOA · IGNOA · IGNOA · ";
  return (
    <div className="overflow-hidden whitespace-nowrap leading-none">
      <motion.div
        animate={{ x: dir > 0 ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
        className="inline-block font-black text-black"
        style={{ fontSize: 80, letterSpacing: "-0.02em", opacity: 0.08 }}
      >
        {text + text}
      </motion.div>
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = () => {
    setErrors({});
    if (!email) { setErrors((p) => ({ ...p, email: "이메일을 입력해주세요" })); return; }
    if (!password) { setErrors((p) => ({ ...p, password: "비밀번호를 입력해주세요" })); return; }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login();
      toast.success("환영합니다!");
      navigate("/app");
    }, 1500);
  };

  const handleOAuthLogin = (provider: string) => {
    toast.info(`${provider} 로그인은 준비중입니다`);
  };

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory">

      {/* ── Section 1: 브랜드 애니메이션 ── */}
      <section className="h-screen snap-start relative overflow-hidden bg-white flex flex-col justify-center">

        {/* 배경 마퀴 */}
        <div className="absolute inset-0 flex flex-col gap-0 select-none pointer-events-none">
          {MARQUEE_ROWS.map((row, i) => (
            <MarqueeRow key={i} {...row} />
          ))}
        </div>

        {/* 고스트 텍스트 — 뒤에 크게 */}
        <motion.div
          initial={{ opacity: 0, rotate: -4 }}
          animate={{ opacity: 0.035, rotate: -3 }}
          transition={{ duration: 1.8, delay: 0.2 }}
          className="absolute left-[-4vw] top-1/2 -translate-y-1/2 text-[28vw] font-black text-black leading-none tracking-tighter select-none pointer-events-none whitespace-nowrap"
        >
          IGNOA
        </motion.div>

        {/* 메인 포스터 타이포 */}
        <div className="absolute inset-0 flex flex-col justify-center px-12 md:px-20 pointer-events-none">

          {/* IGNOA — 클립 슬라이드업 */}
          <div className="flex">
            {["I", "G", "N", "O", "A"].map((char, i) => (
              <div key={i} className="overflow-hidden">
                <motion.span
                  initial={{ y: "108%", rotate: 6 }}
                  animate={{ y: "0%", rotate: 0 }}
                  transition={{ delay: 0.35 + i * 0.07, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  className="block font-black text-black leading-[0.88] tracking-[-0.03em]"
                  style={{ fontSize: "clamp(80px, 16vw, 220px)" }}
                >
                  {char}
                </motion.span>
              </div>
            ))}
          </div>

          {/* 하단 구분선 + 서브텍스트 */}
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.0, duration: 0.6, ease: "easeOut" }}
            className="h-px bg-black/15 mt-6 mb-4 w-full"
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <span className="text-[11px] tracking-[0.3em] uppercase text-black/35 font-medium">
              Seoul · Korea
            </span>
            <span className="text-[11px] tracking-[0.3em] uppercase text-black/35 font-medium">
              Est. 2026
            </span>
          </motion.div>
        </div>

        {/* 스크롤 유도 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.span
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-[11px] tracking-[0.3em] uppercase text-black/40"
          >
            scroll
          </motion.span>
          <div className="w-px h-8 bg-black/10 relative overflow-hidden">
            <motion.div
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-x-0 h-1/2 bg-black/40"
            />
          </div>
        </motion.div>
      </section>

      {/* ── Section 2: 로그인 ── */}
      <section className="h-screen snap-start flex items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: false }}
          className="w-full max-w-sm px-4"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-1">로그인</h2>
            <p className="text-sm text-gray-400">계속하려면 로그인해 주세요.</p>
          </div>

          <div className="space-y-4">
            {/* 이메일 */}
            <div>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === "email" ? "text-black" : "text-gray-400"}`} />
                <input
                  type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: "" }); }}
                  onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="이메일"
                  className={`w-full h-11 pl-9 pr-3 border text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-all ${
                    errors.email ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-gray-300 focus:border-black"
                  }`}
                />
              </div>
              <AnimatePresence>
                {errors.email && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-500 text-xs mt-1.5">{errors.email}</motion.p>}
              </AnimatePresence>
            </div>

            {/* 비밀번호 */}
            <div>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === "password" ? "text-black" : "text-gray-400"}`} />
                <input
                  type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: "" }); }}
                  onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="비밀번호"
                  className={`w-full h-11 pl-9 pr-10 border text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-all ${
                    errors.password ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-gray-300 focus:border-black"
                  }`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-500 text-xs mt-1.5">{errors.password}</motion.p>}
              </AnimatePresence>
            </div>

            {/* 찾기 */}
            <div className="flex justify-end gap-4">
              <button className="text-xs text-gray-400 hover:text-black transition-colors hover:underline underline-offset-2">아이디 찾기</button>
              <button className="text-xs text-gray-400 hover:text-black transition-colors hover:underline underline-offset-2">비밀번호 찾기</button>
            </div>

            {/* 로그인 버튼 */}
            <button
              onClick={handleLogin} disabled={isLoading}
              className="w-full h-11 bg-black hover:bg-gray-800 text-white text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />로그인 중...</div>
                : "로그인"
              }
            </button>

            {/* 구분선 */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">또는</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* OAuth */}
            <div className="space-y-2.5">
              <button
                onClick={() => handleOAuthLogin("카카오")}
                className="w-full h-11 bg-[#FEE500] hover:bg-[#FDD835] text-black text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.486 3 2 6.262 2 10.29c0 2.546 1.693 4.794 4.267 6.124-.167.615-.975 3.584-1.117 4.154-.16.644.235.635.494.46.206-.138 3.29-2.199 3.81-2.55C10.238 18.663 11.105 18.75 12 18.75c5.514 0 10-3.262 10-7.29C22 6.262 17.514 3 12 3z"/>
                </svg>
                카카오로 시작하기
              </button>
              <button
                onClick={() => handleOAuthLogin("구글")}
                className="w-full h-11 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 시작하기
              </button>
            </div>
          </div>

          <div className="mt-7 flex items-center justify-center gap-1.5">
            <span className="text-sm text-gray-400">계정이 없으신가요?</span>
            <button onClick={() => navigate("/signup")} className="text-sm text-gray-500 hover:text-black transition-colors underline underline-offset-2">
              회원가입
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

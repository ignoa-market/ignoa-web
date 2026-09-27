import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/api/auth";
import type { ApiError } from "@/types/api";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrors({});
    if (!email) { setErrors((p) => ({ ...p, email: "이메일을 입력해주세요" })); return; }
    if (!password) { setErrors((p) => ({ ...p, password: "비밀번호를 입력해주세요" })); return; }
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      login(res.user_id, res.access_token);
      toast.success("환영합니다!");
      navigate("/app");
    } catch (err) {
      const error = err as ApiError;
      if (error.code === "ACCOUNT_PENDING_DELETION") {
        const shouldRecover = window.confirm(
          "탈퇴 처리 중인 계정입니다. 탈퇴를 취소하고 계정을 복구하시겠습니까?"
        );
        if (shouldRecover) {
          try {
            const res = await authApi.recover(email, password);
            login(res.user_id, res.access_token);
            toast.success("계정이 복구되었습니다.");
            navigate("/app");
          } catch (recoverErr) {
            const recoverError = recoverErr as ApiError;
            toast.error(recoverError.message ?? "계정 복구에 실패했습니다");
          }
        }
      } else if (error.code === "INVALID_CREDENTIALS") {
        setErrors({ email: "이메일 또는 비밀번호가 올바르지 않습니다" });
      } else {
        toast.error(error.message ?? "로그인에 실패했습니다");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      toast.error("카카오 로그인 설정을 확인해주세요");
      return;
    }
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
    });
    window.location.href = `https://kauth.kakao.com/oauth/authorize?${params}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white pt-[196px]">
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
            <div>
              <button
                onClick={handleKakaoLogin}
                className="w-full h-11 bg-[#FEE500] hover:bg-[#FDD835] text-black text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.486 3 2 6.262 2 10.29c0 2.546 1.693 4.794 4.267 6.124-.167.615-.975 3.584-1.117 4.154-.16.644.235.635.494.46.206-.138 3.29-2.199 3.81-2.55C10.238 18.663 11.105 18.75 12 18.75c5.514 0 10-3.262 10-7.29C22 6.262 17.514 3 12 3z"/>
                </svg>
                카카오로 시작하기
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5">
            <span className="text-sm text-gray-400">계정이 없으신가요?</span>
            <button onClick={() => navigate("/signup")} className="text-sm text-gray-500 hover:text-black transition-colors underline underline-offset-2">
              회원가입
            </button>
          </div>
        </motion.div>
    </div>
  );
}

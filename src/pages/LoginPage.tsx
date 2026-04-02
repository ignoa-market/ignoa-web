import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Mail, Lock, ArrowRight } from "lucide-react";
import logoImage from "@/assets/logo.png";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = () => {
    setErrors({ email: "", password: "" });

    if (!email) {
      setErrors((prev) => ({ ...prev, email: "이메일을 입력해주세요" }));
      return;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "비밀번호를 입력해주세요" }));
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login();
      toast.success("환영합니다!");
      navigate("/app");
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleOAuthLogin = (provider: string) => {
    toast.info(`${provider} 로그인은 준비중입니다`);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white border border-gray-200 p-8 sm:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src={logoImage} alt="IGNOA Logo" className="w-16 h-16 mb-3" />
            <span className="text-3xl font-bold text-black tracking-tight">IGNOA</span>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="text-sm font-medium text-black mb-2 block">이메일</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                  focusedField === 'email' ? 'text-black' : 'text-gray-400'
                }`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: "" });
                  }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  onKeyPress={handleKeyPress}
                  placeholder="이메일을 입력하세요"
                  className={`w-full h-12 pl-12 pr-4 bg-white border text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-gray-200 focus:border-black'
                  }`}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 text-sm mt-2"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-sm font-medium text-black mb-2 block">비밀번호</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-black' : 'text-gray-400'
                }`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: "" });
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onKeyPress={handleKeyPress}
                  placeholder="비밀번호를 입력하세요"
                  className={`w-full h-12 pl-12 pr-4 bg-white border text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-gray-200 focus:border-black'
                  }`}
                />
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 text-sm mt-2"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end items-center gap-3 -mt-1">
              <button className="text-xs text-gray-600 hover:text-black transition-colors duration-200 hover:underline">
                아이디 찾기
              </button>
              <span className="text-gray-300">|</span>
              <button className="text-xs text-gray-600 hover:text-black transition-colors duration-200 hover:underline">
                비밀번호 찾기
              </button>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold text-base transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>로그인 중...</span>
                </div>
              ) : (
                <span>로그인</span>
              )}
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/signup")}
              className="text-sm text-gray-600 hover:text-black transition-colors duration-200 font-medium hover:underline"
            >
              회원가입
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="w-full border-t border-gray-200"></div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            {/* Kakao Login */}
            <Button
              onClick={() => handleOAuthLogin("카카오")}
              className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-semibold text-base transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.486 3 2 6.262 2 10.29c0 2.546 1.693 4.794 4.267 6.124-.167.615-.975 3.584-1.117 4.154-.16.644.235.635.494.46.206-.138 3.29-2.199 3.81-2.55C10.238 18.663 11.105 18.75 12 18.75c5.514 0 10-3.262 10-7.29C22 6.262 17.514 3 12 3z"/>
                </svg>
                <span>카카오로 시작하기</span>
              </div>
            </Button>

            {/* Google Login */}
            <Button
              onClick={() => handleOAuthLogin("구글")}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-semibold text-base transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google로 시작하기</span>
              </div>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

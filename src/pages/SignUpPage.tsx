import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Mail, Lock, User, Clock, MapPin, Search, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import logoImage from "@/assets/logo.png";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { AddressModal } from "@/components/common/AddressModal";

type FormStep = 1 | 2 | 3 | "complete";

const STEP_LABELS = ["이메일", "비밀번호", "프로필"];

export function SignUpPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState<FormStep>(1);

  // Step 1
  const [email, setEmail] = useState("");
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Step 2
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 3
  const [name, setName] = useState("");
  const [isNameChecking, setIsNameChecking] = useState(false);
  const [isNameAvailable, setIsNameAvailable] = useState<boolean | null>(null);
  const [address, setAddress] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const checkEmailDuplicate = () => {
    if (!email.trim()) { setErrors({ email: "이메일을 입력해주세요" }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErrors({ email: "올바른 이메일 형식이 아닙니다" }); return; }
    setIsEmailChecking(true);
    setTimeout(() => {
      const ok = Math.random() > 0.3;
      setIsEmailAvailable(ok);
      setIsEmailChecking(false);
      if (ok) { toast.success("사용 가능한 이메일입니다"); setErrors({}); }
      else setErrors({ email: "이미 사용중인 이메일입니다" });
    }, 800);
  };

  const sendVerificationCode = () => {
    if (!isEmailAvailable) { toast.error("이메일 중복 확인을 먼저 해주세요"); return; }
    setIsCodeSent(true);
    setTimeRemaining(300);
    setVerificationCode("");
    toast.success("인증 코드가 전송되었습니다");
    const timer = setInterval(() => {
      setTimeRemaining((prev) => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
    }, 1000);
  };

  const verifyCode = () => {
    if (verificationCode.length !== 6) { setErrors({ verificationCode: "6자리 코드를 입력해주세요" }); return; }
    if (verificationCode === "123456") {
      setIsCodeVerified(true);
      toast.success("인증 완료");
      setErrors({});
    } else {
      setErrors({ verificationCode: "올바르지 않은 코드입니다" });
    }
  };

  const checkNameDuplicate = () => {
    if (!name.trim()) { setErrors({ name: "이름을 입력해주세요" }); return; }
    setIsNameChecking(true);
    setTimeout(() => {
      const ok = Math.random() > 0.3;
      setIsNameAvailable(ok);
      setIsNameChecking(false);
      if (ok) { toast.success("사용 가능한 이름입니다"); setErrors({}); }
      else setErrors({ name: "이미 사용중인 이름입니다" });
    }, 800);
  };

  const goNext = () => {
    if (step === 1) {
      if (!isEmailAvailable) { setErrors({ email: "이메일 중복 확인을 완료해주세요" }); return; }
      if (!isCodeVerified) { setErrors({ verificationCode: "이메일 인증을 완료해주세요" }); return; }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      if (!password) { setErrors({ password: "비밀번호를 입력해주세요" }); return; }
      if (password.length < 8) { setErrors({ password: "8자 이상 입력해주세요" }); return; }
      if (password !== confirmPassword) { setErrors({ confirmPassword: "비밀번호가 일치하지 않습니다" }); return; }
      setErrors({});
      setStep(3);
    }
  };

  const handleSignUp = () => {
    if (!isNameAvailable) { setErrors({ name: "이름 중복 확인을 완료해주세요" }); return; }
    if (!address.trim()) { setErrors({ address: "주소를 입력해주세요" }); return; }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login();
      setStep("complete");
      setTimeout(() => navigate("/app"), 4000);
    }, 1500);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const passwordStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();
  const strengthMeta = [
    null,
    { label: "약함", color: "bg-red-400", text: "text-red-400" },
    { label: "보통", color: "bg-yellow-400", text: "text-yellow-500" },
    { label: "강함", color: "bg-blue-400", text: "text-blue-500" },
    { label: "매우 강함", color: "bg-green-400", text: "text-green-500" },
  ][passwordStrength];

  if (step === "complete") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-10 left-10 w-96 h-96 bg-black rounded-full blur-3xl" />
          <motion.div animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 1.3, 1] }} transition={{ duration: 10, repeat: Infinity, delay: 1 }} className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gray-400 rounded-full blur-3xl" />
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
              animate={{ opacity: [0, 0.6, 0], y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight - 100, Math.random() * window.innerHeight] }}
              transition={{ duration: 8 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
              className="absolute w-1 h-1 bg-black rounded-full"
            />
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="text-center relative z-10">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
            className="mb-8 flex justify-center"
          >
            <img src={logoImage} alt="IGNOA" className="w-36 h-36" />
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-4xl font-bold text-black mb-3">
            환영합니다, {name}님!
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-gray-500">
            IGNOA의 회원이 되신 것을 축하드립니다.
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const currentStep = step as 1 | 2 | 3;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <img src={logoImage} alt="IGNOA" className="w-12 h-12 mb-3" />
          <span className="text-xl font-bold text-black tracking-tight">IGNOA</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const done = currentStep > n;
            const active = currentStep === n;
            return (
              <div key={n} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    done ? "bg-black text-white" : active ? "bg-black text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : n}
                  </div>
                  <span className={`text-[11px] font-medium transition-colors duration-300 ${active || done ? "text-black" : "text-gray-400"}`}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`flex-1 h-px mx-3 mb-5 transition-all duration-300 ${done ? "bg-black" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Forms */}
        <AnimatePresence mode="wait">

          {/* ── Step 1: 이메일 ── */}
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="space-y-4">
              <div>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === "email" ? "text-black" : "text-gray-400"}`} />
                    <input
                      type="email" value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors({}); setIsEmailAvailable(null); setIsCodeSent(false); setIsCodeVerified(false); }}
                      onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)}
                      onKeyDown={(e) => e.key === "Enter" && checkEmailDuplicate()}
                      placeholder="이메일"
                      className={`w-full h-11 pl-9 pr-3 border text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-all ${
                        errors.email ? "border-red-400 focus:ring-red-200" : isEmailAvailable ? "border-green-400" : "border-gray-300 focus:ring-gray-300 focus:border-black"
                      }`}
                    />
                  </div>
                  <button onClick={checkEmailDuplicate} disabled={isEmailChecking || !email.trim()}
                    className="h-11 px-4 border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-40 whitespace-nowrap">
                    {isEmailChecking ? "확인중..." : "중복확인"}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.email && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-500 text-xs mt-1.5">{errors.email}</motion.p>}
                  {isEmailAvailable && !errors.email && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 text-xs mt-1.5">✓ 사용 가능한 이메일입니다</motion.p>}
                </AnimatePresence>
              </div>

              {/* 인증 코드 전송 버튼 */}
              <AnimatePresence>
                {isEmailAvailable && !isCodeSent && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <button onClick={sendVerificationCode}
                      className="w-full h-11 border border-gray-300 text-sm font-medium text-gray-700 hover:border-black hover:text-black transition-all">
                      인증 코드 전송
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 인증 코드 입력 */}
              <AnimatePresence>
                {isCodeSent && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text" value={verificationCode}
                            onChange={(e) => { setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setErrors({}); }}
                            onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                            placeholder="인증 코드 6자리"
                            disabled={isCodeVerified}
                            maxLength={6}
                            className={`w-full h-11 px-3 border text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-all tracking-widest ${
                              errors.verificationCode ? "border-red-400 focus:ring-red-200" :
                              isCodeVerified ? "border-green-400 bg-green-50/30" :
                              "border-gray-300 focus:border-black focus:ring-gray-300"
                            } disabled:cursor-not-allowed`}
                          />
                          {isCodeVerified
                            ? <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                            : timeRemaining > 0
                            ? <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <span className="text-xs text-gray-400 tabular-nums">{formatTime(timeRemaining)}</span>
                                <span className="text-gray-300">·</span>
                                <button type="button" onClick={sendVerificationCode} className="text-xs text-gray-500 hover:text-black transition-colors">재전송</button>
                              </div>
                            : <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <span className="text-xs text-red-400">만료</span>
                                <span className="text-gray-300">·</span>
                                <button type="button" onClick={sendVerificationCode} className="text-xs text-gray-500 hover:text-black transition-colors">재전송</button>
                              </div>
                          }
                        </div>
                        {!isCodeVerified && (
                          <button onClick={verifyCode}
                            className="h-11 px-4 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-all whitespace-nowrap">
                            확인
                          </button>
                        )}
                      </div>
                      <AnimatePresence>
                        {isCodeVerified && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-green-600">
                            ✓ 인증되었습니다
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <AnimatePresence>
                        {errors.verificationCode && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-500 text-xs">{errors.verificationCode}</motion.p>}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {errors.verificationCode && !isEmailAvailable && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-500 text-xs">{errors.verificationCode}</motion.p>
                )}
              </AnimatePresence>

              <button onClick={goNext} className="w-full h-11 bg-black hover:bg-gray-800 text-white text-sm font-semibold transition-all active:scale-[0.98]">
                다음
              </button>
            </motion.div>
          )}

          {/* ── Step 2: 비밀번호 ── */}
          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="space-y-4">
              <div>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === "password" ? "text-black" : "text-gray-400"}`} />
                  <input
                    type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: "" }); }}
                    onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)}
                    placeholder="비밀번호 (8자 이상)"
                    className={`w-full h-11 pl-9 pr-10 border text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-all ${
                      errors.password ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-gray-300 focus:border-black"
                    }`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${i <= passwordStrength && strengthMeta ? strengthMeta.color : "bg-gray-200"}`} />
                      ))}
                    </div>
                    {strengthMeta && <p className={`text-xs ${strengthMeta.text}`}>{strengthMeta.label}</p>}
                  </div>
                )}
                <AnimatePresence>
                  {errors.password && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-500 text-xs mt-1.5">{errors.password}</motion.p>}
                </AnimatePresence>
              </div>

              <div>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === "confirm" ? "text-black" : "text-gray-400"}`} />
                  <input
                    type={showConfirmPassword ? "text" : "password"} value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors({ ...errors, confirmPassword: "" }); }}
                    onFocus={() => setFocusedField("confirm")} onBlur={() => setFocusedField(null)}
                    placeholder="비밀번호 확인"
                    className={`w-full h-11 pl-9 pr-10 border text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-all ${
                      errors.confirmPassword ? "border-red-400 focus:ring-red-200" :
                      confirmPassword && confirmPassword === password ? "border-green-400" :
                      "border-gray-300 focus:ring-gray-300 focus:border-black"
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.confirmPassword && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-500 text-xs mt-1.5">{errors.confirmPassword}</motion.p>}
                  {confirmPassword && confirmPassword === password && !errors.confirmPassword && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 text-xs mt-1.5">✓ 일치합니다</motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setStep(1)} className="h-11 px-5 border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-all active:scale-[0.98]">이전</button>
                <button onClick={goNext} className="flex-1 h-11 bg-black hover:bg-gray-800 text-white text-sm font-semibold transition-all active:scale-[0.98]">다음</button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: 프로필 ── */}
          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="space-y-4">
              <div>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === "name" ? "text-black" : "text-gray-400"}`} />
                    <input
                      type="text" value={name}
                      onChange={(e) => { setName(e.target.value); setErrors({ ...errors, name: "" }); setIsNameAvailable(null); }}
                      onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField(null)}
                      placeholder="이름"
                      className={`w-full h-11 pl-9 pr-3 border text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-all ${
                        errors.name ? "border-red-400 focus:ring-red-200" : isNameAvailable ? "border-green-400" : "border-gray-300 focus:ring-gray-300 focus:border-black"
                      }`}
                    />
                  </div>
                  <button onClick={checkNameDuplicate} disabled={isNameChecking || !name.trim()}
                    className="h-11 px-4 border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-40 whitespace-nowrap">
                    {isNameChecking ? "확인중..." : "중복확인"}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.name && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-500 text-xs mt-1.5">{errors.name}</motion.p>}
                  {isNameAvailable && !errors.name && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 text-xs mt-1.5">✓ 사용 가능한 이름입니다</motion.p>}
                </AnimatePresence>
              </div>

              <div>
                <button
                  type="button" onClick={() => setShowAddressModal(true)}
                  className={`w-full h-11 px-3 border text-left flex items-center justify-between transition-all focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-black ${
                    errors.address ? "border-red-400" : "border-gray-300 hover:border-black"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`w-4 h-4 flex-shrink-0 ${address ? "text-black" : "text-gray-400"}`} />
                    <span className={`text-sm ${address ? "text-black" : "text-gray-400"}`}>{address || "주소 검색"}</span>
                  </div>
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>
                <AnimatePresence>
                  {errors.address && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-500 text-xs mt-1.5">{errors.address}</motion.p>}
                </AnimatePresence>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setStep(2)} className="h-11 px-5 border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-all active:scale-[0.98]">이전</button>
                <button onClick={handleSignUp} disabled={isLoading}
                  className="flex-1 h-11 bg-black hover:bg-gray-800 text-white text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50">
                  {isLoading
                    ? <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 가입 중...</div>
                    : "가입하기"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center flex items-center justify-center gap-1.5">
          <span className="text-sm text-gray-400">계정이 있으신가요?</span>
          <button onClick={() => navigate("/login")} className="text-sm text-gray-500 hover:text-black transition-colors underline underline-offset-2">
            로그인
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showAddressModal && (
          <AddressModal
            onSelect={(addr) => { setAddress(addr); setErrors((prev) => ({ ...prev, address: "" })); }}
            onClose={() => setShowAddressModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

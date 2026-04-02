import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, Check, Clock } from "lucide-react";
import logoImage from "@/assets/logo.png";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

type SignUpStep = "info" | "complete";

export function SignUpPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState<SignUpStep>("info");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNameChecking, setIsNameChecking] = useState(false);
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [isNameAvailable, setIsNameAvailable] = useState<boolean | null>(null);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Name duplicate check
  const checkNameDuplicate = () => {
    if (!name.trim()) {
      setErrors({ ...errors, name: "이름을 입력해주세요" });
      return;
    }

    setIsNameChecking(true);
    // Mock API call
    setTimeout(() => {
      const isAvailable = Math.random() > 0.3; // 70% success rate
      setIsNameAvailable(isAvailable);
      setIsNameChecking(false);

      if (isAvailable) {
        toast.success("사용 가능한 이름입니다");
        setErrors({ ...errors, name: "" });
      } else {
        setErrors({ ...errors, name: "이미 사용중인 이름입니다" });
      }
    }, 800);
  };

  // Email duplicate check
  const checkEmailDuplicate = () => {
    if (!email.trim()) {
      setErrors({ ...errors, email: "이메일을 입력해주세요" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ ...errors, email: "올바른 이메일 형식이 아닙니다" });
      return;
    }

    setIsEmailChecking(true);
    // Mock API call
    setTimeout(() => {
      const isAvailable = Math.random() > 0.3; // 70% success rate
      setIsEmailAvailable(isAvailable);
      setIsEmailChecking(false);

      if (isAvailable) {
        toast.success("사용 가능한 이메일입니다");
        setErrors({ ...errors, email: "" });
      } else {
        setErrors({ ...errors, email: "이미 사용중인 이메일입니다" });
      }
    }, 800);
  };

  // Send verification code
  const sendVerificationCode = () => {
    if (!isEmailAvailable) {
      toast.error("이메일 중복 확인을 먼저 진행해주세요");
      return;
    }

    setIsCodeSent(true);
    setTimeRemaining(300); // 5 minutes
    setVerificationCode("");
    toast.success("인증 코드가 이메일로 전송되었습니다");

    // Timer countdown
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Resend verification code
  const resendVerificationCode = () => {
    setIsCodeVerified(false);
    sendVerificationCode();
    toast.success("인증 코드가 재전송되었습니다");
  };

  // Verify code
  const verifyCode = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setErrors({ ...errors, verificationCode: "6자리 인증 코드를 입력해주세요" });
      return;
    }

    // Mock verification (in real app, check with backend)
    const isValid = verificationCode === "123456"; // Mock code

    if (isValid) {
      setIsCodeVerified(true);
      toast.success("이메일 인증이 완료되었습니다");
      setErrors({ ...errors, verificationCode: "" });
    } else {
      toast.error("인증 코드가 올바르지 않습니다");
      setErrors({ ...errors, verificationCode: "올바르지 않은 인증 코드입니다" });
    }
  };

  const handleSignUp = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) newErrors.name = "이름을 입력해주세요";
    if (!isNameAvailable) newErrors.name = "이름 중복 확인을 완료해주세요";
    if (!email.trim()) newErrors.email = "이메일을 입력해주세요";
    if (!isEmailAvailable) newErrors.email = "이메일 중복 확인을 완료해주세요";
    if (!isCodeVerified) newErrors.verificationCode = "이메일 인증을 완료해주세요";
    if (!password) {
      newErrors.password = "비밀번호를 입력해주세요";
    } else if (password.length < 8) {
      newErrors.password = "비밀번호는 8자 이상이어야 합니다";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login();
      setStep("complete");
      setTimeout(() => {
        navigate("/app");
      }, 4000);
    }, 1500);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (step === "complete") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-10 left-10 w-96 h-96 bg-black rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.05, 0.15, 0.05],
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, 40, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gray-400 rounded-full blur-3xl"
          />

          {/* Floating Particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight
              }}
              animate={{
                opacity: [0, 0.6, 0],
                y: [
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight - 100,
                  Math.random() * window.innerHeight
                ],
                x: [
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerWidth + (Math.random() - 0.5) * 100,
                  Math.random() * window.innerWidth
                ]
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut"
              }}
              className="absolute w-1 h-1 bg-black rounded-full"
            />
          ))}

          {/* Subtle Wave Effect */}
          <motion.div
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "radial-gradient(circle at center, black 1px, transparent 1px)",
              backgroundSize: "50px 50px"
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md w-full relative z-10"
        >
          {/* Logo with simple bounce */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: [0, -12, 0], opacity: 1 }}
            transition={{
              y: {
                delay: 0.2,
                duration: 0.8,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut"
              },
              opacity: { duration: 0.4 }
            }}
            className="mb-8 flex justify-center relative"
          >
            {/* Glow effect behind logo */}
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-black/20 blur-2xl rounded-full"
            />
            <img
              src={logoImage}
              alt="Ignoa Logo"
              className="w-24 h-24 relative z-10"
            />
          </motion.div>

          {/* Welcome Text with Name */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-4xl font-bold text-black mb-3"
          >
            환영합니다, {name}님!
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-gray-600 text-lg"
          >
            IGNOA의 회원이 되신 것을 축하드립니다
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 relative overflow-hidden">
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
            {/* Name Field with Duplicate Check */}
            <div>
              <label className="text-sm font-medium text-black mb-2 block">이름</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                    focusedField === 'name' ? 'text-black' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors({ ...errors, name: "" });
                      setIsNameAvailable(null);
                    }}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="이름을 입력하세요"
                    className={`w-full h-12 pl-12 pr-4 bg-white border text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.name
                        ? 'border-red-500 focus:ring-red-200'
                        : isNameAvailable
                        ? 'border-green-500 focus:ring-green-200'
                        : 'border-gray-300 focus:ring-gray-200 focus:border-black'
                    }`}
                  />
                </div>
                <Button
                  onClick={checkNameDuplicate}
                  disabled={isNameChecking || !name.trim()}
                  className="h-12 px-4 bg-white hover:bg-gray-50 text-black border border-gray-300 font-medium text-sm transition-all duration-200 disabled:opacity-50"
                >
                  {isNameChecking ? "확인중..." : "중복확인"}
                </Button>
              </div>
              <AnimatePresence>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 text-sm mt-2"
                  >
                    {errors.name}
                  </motion.p>
                )}
                {isNameAvailable && !errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-600 text-sm mt-2"
                  >
                    ✓ 사용 가능한 이름입니다
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Email Field with Duplicate Check */}
            <div>
              <label className="text-sm font-medium text-black mb-2 block">이메일</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                    focusedField === 'email' ? 'text-black' : 'text-gray-400'
                  }`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors({ ...errors, email: "" });
                      setIsEmailAvailable(null);
                      setIsCodeSent(false);
                      setIsCodeVerified(false);
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="이메일을 입력하세요"
                    className={`w-full h-12 pl-12 pr-4 bg-white border text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.email
                        ? 'border-red-500 focus:ring-red-200'
                        : isEmailAvailable
                        ? 'border-green-500 focus:ring-green-200'
                        : 'border-gray-300 focus:ring-gray-200 focus:border-black'
                    }`}
                  />
                </div>
                <Button
                  onClick={checkEmailDuplicate}
                  disabled={isEmailChecking || !email.trim()}
                  className="h-12 px-4 bg-white hover:bg-gray-50 text-black border border-gray-300 font-medium text-sm transition-all duration-200 disabled:opacity-50"
                >
                  {isEmailChecking ? "확인중..." : "중복확인"}
                </Button>
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
                {isEmailAvailable && !errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-600 text-sm mt-2"
                  >
                    ✓ 사용 가능한 이메일입니다
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Email Verification Code */}
            {isEmailAvailable && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="text-sm font-medium text-black mb-2 block">이메일 인증</label>
                <div className="flex gap-2 mb-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setVerificationCode(value);
                        setErrors({ ...errors, verificationCode: "" });
                      }}
                      placeholder="6자리 인증 코드"
                      disabled={!isCodeSent || isCodeVerified}
                      maxLength={6}
                      className={`w-full h-12 px-4 bg-white border text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.verificationCode
                          ? 'border-red-500 focus:ring-red-200'
                          : isCodeVerified
                          ? 'border-green-500 focus:ring-green-200'
                          : 'border-gray-300 focus:ring-gray-200 focus:border-black'
                      } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                    />
                  </div>
                  {!isCodeVerified && (
                    <Button
                      onClick={isCodeSent ? verifyCode : sendVerificationCode}
                      disabled={!isEmailAvailable || isCodeVerified}
                      className="h-12 px-4 bg-black hover:bg-gray-800 text-white font-medium text-sm transition-all duration-200 disabled:opacity-50"
                    >
                      {isCodeSent ? "인증확인" : "코드전송"}
                    </Button>
                  )}
                </div>
                {isCodeSent && !isCodeVerified && timeRemaining > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>남은 시간: {formatTime(timeRemaining)}</span>
                    <button
                      onClick={resendVerificationCode}
                      className="ml-auto text-xs text-gray-500 hover:text-black underline transition-colors duration-200"
                    >
                      재전송
                    </button>
                  </div>
                )}
                {isCodeSent && !isCodeVerified && timeRemaining === 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-red-500">인증 시간이 만료되었습니다</span>
                    <button
                      onClick={resendVerificationCode}
                      className="ml-auto text-xs text-black underline font-medium hover:text-gray-700 transition-colors duration-200"
                    >
                      재전송
                    </button>
                  </div>
                )}
                <AnimatePresence>
                  {errors.verificationCode && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 text-sm mt-2"
                    >
                      {errors.verificationCode}
                    </motion.p>
                  )}
                  {isCodeVerified && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-green-600 text-sm mt-2"
                    >
                      ✓ 이메일 인증이 완료되었습니다
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

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
                  placeholder="비밀번호를 입력하세요 (8자 이상)"
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

            {/* Confirm Password Field */}
            <div>
              <label className="text-sm font-medium text-black mb-2 block">비밀번호 확인</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                  focusedField === 'confirmPassword' ? 'text-black' : 'text-gray-400'
                }`} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({ ...errors, confirmPassword: "" });
                  }}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="비밀번호를 다시 입력하세요"
                  className={`w-full h-12 pl-12 pr-4 bg-white border text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-gray-200 focus:border-black'
                  }`}
                />
              </div>
              <AnimatePresence>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 text-sm mt-2"
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Sign Up Button */}
            <Button
              onClick={handleSignUp}
              disabled={isLoading}
              className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold text-base transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>가입 중...</span>
                </div>
              ) : (
                <span>회원가입</span>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

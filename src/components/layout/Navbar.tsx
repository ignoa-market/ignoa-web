import { Link, useNavigate } from "react-router";
import { Menu, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import logoImage from "@/assets/logo.png";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/api/auth";
import { WithdrawalModal } from "@/components/common/WithdrawalModal";
import { motion, AnimatePresence } from "motion/react";

export function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated, isInitializing, logout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // 서버 오류여도 로컬 로그아웃은 진행
    }
    logout();
    toast.success("로그아웃되었습니다");
    navigate("/app");
  };

  return (
    <>
      <nav className="fixed top-20 left-0 right-0 z-50 bg-white">
        <div className="max-w-[1400px] mx-auto px-8 py-3.5">
          <div className="flex items-center gap-8">
            {/* Logo + Logo Name */}
            <Link to="/app" className="flex items-center gap-3 flex-shrink-0">
              <img src={logoImage} alt="IGNOA" className="h-9 w-9" />
              <span className="text-2xl font-bold text-black tracking-tight">IGNOA</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-[500px] relative">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 transition-colors group-focus-within:text-black pointer-events-none" />
                <input
                  type="text"
                  placeholder="브랜드, 상품명 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-9 pr-8 bg-white rounded-full text-sm font-medium text-black placeholder:text-gray-400 placeholder:font-light outline-none border border-gray-200 transition-all duration-200 focus:border-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-auto">
              {isInitializing ? (
                <div className="w-[180px]" />
              ) : isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link to="/app/register-product">
                    <button className="h-9 px-3 text-sm font-medium text-gray-700 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:text-black active:translate-y-0">
                      상품 등록
                    </button>
                  </Link>

                  <button
                    onClick={() => navigate("/app/messages")}
                    className="h-9 px-3 text-sm font-medium text-gray-700 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:text-black active:translate-y-0"
                  >
                    메시지
                  </button>

                  {/* 프로필 드롭다운 */}
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      onClick={() => setProfileMenuOpen((v) => !v)}
                      className={`h-9 px-3 text-sm font-medium rounded-full transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                        profileMenuOpen ? "text-black" : "text-gray-700 hover:text-black"
                      }`}
                    >
                      계정
                    </button>

                    <AnimatePresence>
                      {profileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.12 }}
                          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-36 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden z-50"
                        >
                          <Link
                            to="/app/profile"
                            onClick={() => setProfileMenuOpen(false)}
                            className="block text-center py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            마이페이지
                          </Link>
                          <button
                            onClick={() => {
                              setProfileMenuOpen(false);
                              toast.info("아직 준비 중인 기능입니다.");
                            }}
                            className="w-full text-center py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            고객센터
                          </button>
                          <button
                            onClick={() => { handleLogout(); setProfileMenuOpen(false); }}
                            className="w-full text-center py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            로그아웃
                          </button>
                          <button
                            onClick={() => { setProfileMenuOpen(false); setWithdrawalOpen(true); }}
                            className="w-full text-center py-2.5 text-sm text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors"
                          >
                            회원탈퇴
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/login")}
                    className="h-9 px-4 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="h-9 px-4 text-sm font-semibold bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                  >
                    회원가입
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Bar */}
        <div className="border-b border-gray-200">
          <div className="max-w-[1400px] mx-auto px-8">
            <div className="flex items-center gap-3">
              {["카테고리", "한정판", "빈티지", "콜라보", "라이프", "브랜드", "기획전"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toast.info("아직 준비 중인 기능입니다.")}
                  className="my-1 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 rounded-full whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100 hover:text-black active:translate-y-0"
                >
                  {cat === "카테고리" && <Menu className="h-4 w-4" />}
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Chat Panel */}
      <AnimatePresence>
      </AnimatePresence>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {withdrawalOpen && (
          <WithdrawalModal
            onClose={() => setWithdrawalOpen(false)}
            onWithdrawn={() => { setWithdrawalOpen(false); logout(); navigate("/app"); }}
          />
        )}
      </AnimatePresence>

    </>
  );
}

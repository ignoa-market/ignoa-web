import { Link, useNavigate } from "react-router";
import { Search, X, User, MessageSquare, Bell } from "lucide-react";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import logoImage from "@/assets/logo.png";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/api/auth";
import { ChatPanel } from "@/components/common/ChatPanel";
import { NotificationPanel } from "@/components/common/NotificationPanel";
import { WithdrawalModal } from "@/components/common/WithdrawalModal";
import { motion, AnimatePresence } from "motion/react";

const POPULAR_SEARCHES = [
  "나이키 덩크 로우",
  "아크테릭스 베타",
  "스톤아일랜드",
  "몽클레어 패딩",
  "발렌시아가 트리플S",
  "노스페이스 눕시",
  "아미 하트 니트",
  "메종 마르지엘라",
  "팔라스 트라이앵글",
  "슈프림 박스로고",
];

export function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const searchContainerRef = useRef<HTMLDivElement>(null);
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
      <nav className="fixed top-20 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-8 py-3.5">
          <div className="flex items-center gap-8">
            {/* Logo + Logo Name */}
            <Link to="/app" className="flex items-center gap-3 flex-shrink-0">
              <img src={logoImage} alt="IGNOA" className="h-9 w-9" />
              <span className="text-2xl font-bold text-black tracking-tight">IGNOA</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-[500px] relative" ref={searchContainerRef}>
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 transition-colors group-focus-within:text-black pointer-events-none" />
                <input
                  type="text"
                  placeholder="브랜드, 상품명 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={(e) => {
                    if (!searchContainerRef.current?.contains(e.relatedTarget as Node)) {
                      setSearchFocused(false);
                    }
                  }}
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

              {/* Search Dropdown */}
              <AnimatePresence>
                {searchFocused && !searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 shadow-lg z-50 py-5 px-5"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <p className="text-[10px] font-semibold tracking-[0.25em] text-gray-400 uppercase mb-4">인기 검색어</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      {POPULAR_SEARCHES.map((keyword, i) => (
                        <button
                          key={keyword}
                          onClick={() => { setSearchQuery(keyword); setSearchFocused(false); }}
                          className="flex items-center gap-2.5 py-1.5 text-left hover:opacity-60 transition-opacity"
                        >
                          <span className="text-[11px] font-bold text-gray-300 w-4 flex-shrink-0">{i + 1}</span>
                          <span className="text-sm font-light text-black truncate">{keyword}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-auto">
              {isAuthenticated ? (
                <div className="flex items-center gap-5">
                  <Link to="/app/register-product">
                    <button className="h-9 px-4 text-sm font-semibold bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
                      상품 등록
                    </button>
                  </Link>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setNotiOpen((v) => !v); setChatOpen(false); }}
                      className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                        notiOpen ? "bg-gray-200 text-black" : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black"
                      }`}
                      title="알림"
                    >
                      <Bell className="w-[18px] h-[18px]" />
                    </button>
                    <button
                      onClick={() => { setChatOpen((v) => !v); setNotiOpen(false); }}
                      className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                        chatOpen ? "bg-gray-200 text-black" : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black"
                      }`}
                      title="채팅"
                    >
                      <MessageSquare className="w-[18px] h-[18px]" />
                    </button>

                  {/* 프로필 드롭다운 */}
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      onClick={() => setProfileMenuOpen((v) => !v)}
                      className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                        profileMenuOpen ? "bg-gray-200 text-black" : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black"
                      }`}
                    >
                      <User className="w-[18px] h-[18px]" />
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
                            onClick={() => setProfileMenuOpen(false)}
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
      </nav>

      {/* Notification Panel */}
      <AnimatePresence>
        {notiOpen && <NotificationPanel onClose={() => setNotiOpen(false)} />}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
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

      {/* Backdrop */}
      <AnimatePresence>
        {(chatOpen || notiOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => { setChatOpen(false); setNotiOpen(false); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

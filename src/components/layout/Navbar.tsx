import { Link, useNavigate } from "react-router";
import { Search, User, PackagePlus, LogIn, LogOut, X, MessageCircle, Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import logoImage from "@/assets/logo.png";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/api/auth";
import { ChatPanel } from "@/components/common/ChatPanel";
import { NotificationPanel } from "@/components/common/NotificationPanel";
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

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // 서버 오류여도 로컬 로그아웃은 진행
    }
    logout();
    toast.success("로그아웃되었습니다");
    navigate("/login");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-8 py-5">
          <div className="flex items-center gap-8">
            {/* Logo + Logo Name */}
            <Link to="/app" className="flex items-center gap-3 flex-shrink-0">
              <img src={logoImage} alt="IGNOA" className="h-9 w-9" />
              <span className="text-2xl font-bold text-black tracking-tight">IGNOA</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-[500px] relative" ref={searchContainerRef}>
              <div className="relative group">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 transition-colors group-focus-within:text-black pointer-events-none" />
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
                  className="w-full h-9 pl-6 pr-6 bg-transparent border-0 border-b border-gray-200 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black"
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
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setNotiOpen((v) => !v); setChatOpen(false); }}
                    className="h-11 w-11 text-gray-700 hover:text-black hover:bg-gray-100 relative"
                    title="알림"
                  >
                    <Bell className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setChatOpen((v) => !v); setNotiOpen(false); }}
                    className="h-11 w-11 text-gray-700 hover:text-black hover:bg-gray-100 relative"
                    title="채팅"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </Button>
                  <Link to="/app/register-product">
                    <Button variant="ghost" size="icon" className="h-11 w-11 text-gray-700 hover:text-black hover:bg-gray-100" title="상품 등록">
                      <PackagePlus className="w-6 h-6" />
                    </Button>
                  </Link>
                  <Link to="/app/profile">
                    <Button variant="ghost" size="icon" className="h-11 w-11 text-gray-700 hover:text-black hover:bg-gray-100" title="내 정보">
                      <User className="w-6 h-6" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="h-11 w-11 text-gray-700 hover:text-red-500 hover:bg-gray-100" title="로그아웃">
                    <LogOut className="w-6 h-6" />
                  </Button>
                </>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => navigate("/login")} className="h-11 w-11 text-gray-700 hover:text-black hover:bg-gray-100" title="로그인">
                  <LogIn className="w-6 h-6" />
                </Button>
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

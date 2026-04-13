import { Link, useNavigate } from "react-router";
import { Search, User, PackagePlus, LogIn, LogOut, X, MessageCircle, Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import logoImage from "@/assets/logo.png";
import { useAuth } from "@/context/AuthContext";
import { ChatPanel } from "@/components/common/ChatPanel";
import { NotificationPanel } from "@/components/common/NotificationPanel";
import { motion, AnimatePresence } from "motion/react";

const SEARCH_DATA = {
  artists: [
    "Frank Ocean", "Tyler, The Creator", "wave to earth", "SZA", "Mac Miller",
    "Daniel Caesar", "Justin Bieber", "Oasis", "Baek Yerin", "Hyukoh",
    "The Black Skirts", "Jannabi",
  ],
  albums: [
    { title: "Blonde", artist: "Frank Ocean" },
    { title: "channel ORANGE", artist: "Frank Ocean" },
    { title: "Nostalgia, Ultra", artist: "Frank Ocean" },
    { title: "IGOR", artist: "Tyler, The Creator" },
    { title: "Flower Boy", artist: "Tyler, The Creator" },
    { title: "Call Me If You Get Lost", artist: "Tyler, The Creator" },
    { title: "uncounted 0.00", artist: "wave to earth" },
    { title: "0.1 flaws and all", artist: "wave to earth" },
    { title: "SOS", artist: "SZA" },
    { title: "CTRL", artist: "SZA" },
    { title: "Swimming", artist: "Mac Miller" },
    { title: "Circles", artist: "Mac Miller" },
    { title: "good AM", artist: "Mac Miller" },
    { title: "Freudian", artist: "Daniel Caesar" },
  ],
};

export function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const query = searchQuery.trim().toLowerCase();
  const matchedArtists = query
    ? SEARCH_DATA.artists.filter((a) => a.toLowerCase().includes(query)).slice(0, 3)
    : [];
  const matchedAlbums = query
    ? SEARCH_DATA.albums.filter((a) => a.title.toLowerCase().includes(query) || a.artist.toLowerCase().includes(query)).slice(0, 3)
    : [];
  const showDropdown = searchFocused && query.length > 0 && (matchedArtists.length > 0 || matchedAlbums.length > 0);

  const handleLogout = () => {
    logout();
    toast.success("로그아웃되었습니다");
    setTimeout(() => navigate("/login"), 500);
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
            <div className="flex-1 max-w-[500px]" ref={searchRef}>
              <div className="relative group">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 transition-colors group-focus-within:text-black pointer-events-none" />
                <input
                  type="text"
                  placeholder="아티스트, LP 앨범명 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className="w-full h-9 pl-6 pr-6 bg-transparent border-0 border-b border-gray-200 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setSearchFocused(false); }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* 검색 드롭다운 */}
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.12 }}
                      className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-lg shadow-md z-50 overflow-hidden"
                    >
                      {matchedArtists.length > 0 && (
                        <div>
                          <p className="text-[9px] font-semibold text-gray-300 uppercase tracking-[0.15em] px-4 pt-3 pb-1">아티스트</p>
                          {matchedArtists.map((artist) => (
                            <button
                              key={artist}
                              onMouseDown={() => { setSearchQuery(artist); setSearchFocused(false); }}
                              className="w-full flex items-center px-4 py-1.5 hover:bg-gray-50 transition-colors text-left"
                            >
                              <span className="text-sm text-black">{artist}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {matchedAlbums.length > 0 && (
                        <div className={matchedArtists.length > 0 ? "border-t border-gray-50" : ""}>
                          <p className="text-[9px] font-semibold text-gray-300 uppercase tracking-[0.15em] px-4 pt-3 pb-1">앨범</p>
                          {matchedAlbums.map((album) => (
                            <button
                              key={`${album.artist}-${album.title}`}
                              onMouseDown={() => { setSearchQuery(album.title); setSearchFocused(false); }}
                              className="w-full flex items-center gap-2 px-4 py-1.5 hover:bg-gray-50 transition-colors text-left"
                            >
                              <span className="text-sm text-black">{album.title}</span>
                              <span className="text-xs text-gray-300">— {album.artist}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="h-2" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-black" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setChatOpen((v) => !v); setNotiOpen(false); }}
                    className="h-11 w-11 text-gray-700 hover:text-black hover:bg-gray-100 relative"
                    title="채팅"
                  >
                    <MessageCircle className="w-6 h-6" />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-black" />
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

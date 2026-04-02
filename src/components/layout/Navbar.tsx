import { Link, useLocation, useNavigate } from "react-router";
import { Search, User, Heart, Tag, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import logoImage from "@/assets/logo.png";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("로그아웃되었습니다");
    setTimeout(() => {
      navigate("/login");
    }, 500);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-6 py-3">
        <div className="flex items-center gap-6">
          {/* Logo + Logo Name */}
          <Link to="/app" className="flex items-center gap-2 flex-shrink-0">
            <img src={logoImage} alt="IGNOA" className="h-6 w-6" />
            <span className="text-lg font-bold text-black tracking-tight">IGNOA</span>
          </Link>

          {/* Search Bar - Always visible */}
          <div className="flex-1 max-w-[500px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-gray-50 border-gray-200 text-sm placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black"
              />
            </div>
          </div>

          {/* Right Actions - Conditional based on auth */}
          <div className="flex items-center gap-1 ml-auto">
            {isAuthenticated ? (
              <>
                {/* Authenticated: Show all icons */}
                <Link to="/app/register-product">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-700 hover:text-black hover:bg-gray-100"
                    title="상품 판매"
                  >
                    <Tag className="w-5 h-5" />
                  </Button>
                </Link>

                <Link to="/app/wishlist">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-700 hover:text-black hover:bg-gray-100"
                    title="위시리스트"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                </Link>

                <Link to="/app/profile">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-700 hover:text-black hover:bg-gray-100"
                    title="내 정보"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-9 w-9 text-gray-700 hover:text-red-600 hover:bg-red-50"
                  title="로그아웃"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                {/* Not authenticated: Show only login icon */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/login")}
                  className="h-9 w-9 text-gray-700 hover:text-black hover:bg-gray-100"
                  title="로그인"
                >
                  <LogIn className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

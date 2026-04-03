import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export function TopBar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    toast.success("로그아웃되었습니다");
    setTimeout(() => navigate("/login"), 500);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-8 bg-white border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-8 h-full flex items-center justify-end gap-3 text-xs text-gray-500">
        <button onClick={handleLogout} className="hover:text-black transition-colors">
          로그아웃
        </button>
        <span className="text-gray-300">|</span>
        <button className="relative hover:text-black transition-colors">
          알림
          <span className="absolute -top-0.5 -right-2 w-1.5 h-1.5 bg-black rounded-full" />
        </button>
      </div>
    </div>
  );
}

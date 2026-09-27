import logoImage from "@/assets/logo.png";
import { Link } from "react-router";

export function AnnouncementBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[54px] bg-black flex items-center justify-center">
      <div className="flex items-center justify-center gap-6" style={{ zoom: 0.9 }}>
        <img src={logoImage} alt="IGNOA" className="h-5 w-5 rounded-md opacity-80 invert" />
        <p className="text-base text-white font-medium">앱에서 이그노아를 제대로 즐겨보세요!</p>
        <Link to="/download" className="flex h-8 items-center rounded-full bg-blue-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-400">
          앱 다운로드
        </Link>
      </div>
    </div>
  );
}

import logoImage from "@/assets/logo.png";

export function AnnouncementBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-20 bg-black flex items-center justify-center gap-6">
      <img src={logoImage} alt="IGNOA" className="h-5 w-5 opacity-80 invert" />
      <p className="text-base text-white font-medium">앱에서 이그노아를 제대로 즐겨보세요!</p>
      <button className="text-sm font-semibold bg-blue-500 hover:bg-blue-400 transition-colors text-white px-4 h-8 rounded-full">
        앱 다운로드
      </button>
    </div>
  );
}

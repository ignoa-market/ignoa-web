import { useState, useEffect } from "react";

export function AnnouncementBanner() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const endTime = new Date();
    endTime.setHours(23, 59, 59, 0);

    const tick = () => {
      const diff = endTime.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-9 bg-black flex items-center justify-center px-6">
      <p className="text-white text-xs font-medium tracking-wide">
        신규 가입 회원 첫 입찰 수수료 무료! 지금 바로 경매에 참여하세요
      </p>
      {timeLeft && (
        <span className="absolute right-6 bg-white/15 text-white text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded">
          {timeLeft}
        </span>
      )}
    </div>
  );
}

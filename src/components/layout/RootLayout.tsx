import { Outlet, ScrollRestoration, useLocation } from "react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";

export function Root() {
  const location = useLocation();
  const shouldShowNavbar = true;
  const shouldShowFooter = !["/login", "/signup"].includes(location.pathname);

  return (
    <>
      {/* 새 페이지는 맨 위에서, 뒤로가기는 이전 스크롤 위치에서 시작한다.
          경로 기준으로 기억해 쿼리만 바뀔 때(채팅방 선택 등)는 스크롤이 튀지 않는다 */}
      <ScrollRestoration getKey={(location) => location.pathname} />
      {shouldShowNavbar && <AnnouncementBanner />}
      {shouldShowNavbar && <Navbar />}
      <Outlet />
      {shouldShowFooter && <Footer />}
    </>
  );
}

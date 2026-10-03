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
          쿼리만 바꾸는 이동(채팅방 선택 등)은 preventScrollReset으로 스크롤을 유지한다 */}
      <ScrollRestoration />
      {shouldShowNavbar && <AnnouncementBanner />}
      {shouldShowNavbar && <Navbar />}
      <Outlet />
      {shouldShowFooter && <Footer />}
    </>
  );
}

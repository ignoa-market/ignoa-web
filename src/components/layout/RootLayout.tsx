import { Outlet, useLocation } from "react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/common/ScrollToTop";

export function Root() {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/signup"];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      <ScrollToTop />
      {shouldShowNavbar && <Navbar />}
      <main className={shouldShowNavbar ? "pt-[76px]" : ""}>
        <Outlet />
      </main>
      {shouldShowNavbar && <Footer />}
    </>
  );
}

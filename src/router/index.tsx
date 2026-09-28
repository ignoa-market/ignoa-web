import { createBrowserRouter, Navigate } from "react-router";
import { Root } from "@/components/layout/RootLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

function RouteLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
      불러오는 중입니다.
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/app" replace />,
  },
  {
    path: "/app",
    Component: Root,
    children: [
      {
        index: true,
        HydrateFallback: RouteLoadingFallback,
        lazy: async () => ({ Component: (await import("@/pages/HomePage")).HomePage }),
      },
      {
        path: "products/:id",
        HydrateFallback: RouteLoadingFallback,
        lazy: async () => ({ Component: (await import("@/pages/ProductDetailPage")).ProductDetailPage }),
      },
      {
        Component: ProtectedRoute,
        children: [
          {
            path: "register-product",
            HydrateFallback: RouteLoadingFallback,
            lazy: async () => ({ Component: (await import("@/pages/ProductRegistrationPage")).ProductRegistrationPage }),
          },
          {
            path: "products/:id/edit",
            HydrateFallback: RouteLoadingFallback,
            lazy: async () => ({ Component: (await import("@/pages/ProductEditPage")).ProductEditPage }),
          },
          {
            path: "profile",
            HydrateFallback: RouteLoadingFallback,
            lazy: async () => ({ Component: (await import("@/pages/ProfilePage")).ProfilePage }),
          },
          {
            path: "messages",
            HydrateFallback: RouteLoadingFallback,
            lazy: async () => ({ Component: (await import("@/pages/MessagesPage")).MessagesPage }),
          },
        ],
      },
    ],
  },
  {
    path: "/download",
    Component: Root,
    children: [
      {
        index: true,
        HydrateFallback: RouteLoadingFallback,
        lazy: async () => ({ Component: (await import("@/pages/AppDownloadPage")).AppDownloadPage }),
      },
    ],
  },
  {
    path: "/support",
    Component: Root,
    children: [
      {
        index: true,
        HydrateFallback: RouteLoadingFallback,
        lazy: async () => ({ Component: (await import("@/pages/SupportPage")).SupportPage }),
      },
    ],
  },
  {
    path: "/login",
    Component: Root,
    children: [
      {
        index: true,
        HydrateFallback: RouteLoadingFallback,
        lazy: async () => ({ Component: (await import("@/pages/LoginPage")).LoginPage }),
      },
    ],
  },
  {
    path: "/signup",
    Component: Root,
    children: [
      {
        index: true,
        HydrateFallback: RouteLoadingFallback,
        lazy: async () => ({ Component: (await import("@/pages/SignUpPage")).SignUpPage }),
      },
    ],
  },
  {
    path: "/oauth/kakao/callback",
    HydrateFallback: RouteLoadingFallback,
    lazy: async () => ({ Component: (await import("@/pages/OAuthKakaoCallbackPage")).OAuthKakaoCallbackPage }),
  },
]);

import { createBrowserRouter, Navigate } from "react-router";
import { HomePage } from "@/pages/HomePage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { ProductRegistrationPage } from "@/pages/ProductRegistrationPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { MessagesPage } from "@/pages/MessagesPage";
import { LoginPage } from "@/pages/LoginPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { Root } from "@/components/layout/RootLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/app" replace />,
  },
  {
    path: "/app",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "product/:id", Component: ProductDetailPage },
      { path: "products/:id", Component: ProductDetailPage },
      { path: "register-product", Component: ProductRegistrationPage },
      { path: "profile", Component: ProfilePage },
      { path: "messages", Component: MessagesPage },
    ],
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignUpPage,
  },
]);

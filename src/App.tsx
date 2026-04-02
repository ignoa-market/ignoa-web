import { RouterProvider } from "react-router";
import { router } from "./router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}

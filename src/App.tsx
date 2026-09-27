import { RouterProvider } from "react-router";
import { router } from "./router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors />
      </ChatProvider>
    </AuthProvider>
  );
}

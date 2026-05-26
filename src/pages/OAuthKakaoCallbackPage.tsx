import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { authApi } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import type { ApiError } from "@/types/api";

export function OAuthKakaoCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      toast.error("카카오 로그인에 실패했습니다");
      navigate("/login");
      return;
    }

    authApi.kakaoLogin(code)
      .then((res) => {
        login(res.user_id, res.access_token);
        navigate("/app");
      })
      .catch((err: ApiError) => {
        toast.error(err.message ?? "카카오 로그인에 실패했습니다");
        navigate("/login");
      });
  }, []);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { setAccessToken, setUnauthorizedHandler } from "@/lib/api";
import { authApi, userApi } from "@/api/auth";

interface AuthState {
  isAuthenticated: boolean;
  userId: number | null;
  isInitializing: boolean;
}

interface AuthContextType extends AuthState {
  login: (userId: number, accessToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    userId: null,
    isInitializing: true,
  });

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    authApi.refresh()
      .then(async (res) => {
        setAccessToken(res.access_token);
        const me = await userApi.getMe();
        setState({ isAuthenticated: true, userId: me.user_id, isInitializing: false });
      })
      .catch(() => {
        setState({ isAuthenticated: false, userId: null, isInitializing: false });
      });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAccessToken(null);
      setState({ isAuthenticated: false, userId: null, isInitializing: false });
    });
  }, []);

  const login = (userId: number, accessToken: string) => {
    setAccessToken(accessToken);
    setState({ isAuthenticated: true, userId, isInitializing: false });
  };

  const logout = () => {
    setAccessToken(null);
    setState({ isAuthenticated: false, userId: null, isInitializing: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

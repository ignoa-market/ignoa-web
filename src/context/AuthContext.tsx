import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback, ReactNode } from "react";
import { refreshAccessToken, setAccessToken, setUnauthorizedHandler } from "@/lib/api";
import { userApi } from "@/api/auth";
import { wishStore } from "@/store/wishStore";

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

    refreshAccessToken()
      .then(async (token) => {
        if (!token) {
          setState({ isAuthenticated: false, userId: null, isInitializing: false });
          return;
        }
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
      wishStore.clear();
      setState({ isAuthenticated: false, userId: null, isInitializing: false });
    });
  }, []);

  const login = useCallback((userId: number, accessToken: string) => {
    setAccessToken(accessToken);
    wishStore.clear();
    setState({ isAuthenticated: true, userId, isInitializing: false });
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    wishStore.clear();
    setState({ isAuthenticated: false, userId: null, isInitializing: false });
  }, []);

  const value = useMemo(
    () => ({ ...state, login, logout }),
    [state, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
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

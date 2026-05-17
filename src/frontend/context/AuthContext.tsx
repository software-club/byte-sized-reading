import { clearTokens, getTokens, storeTokens } from "@/helpers/token";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (accessToken: string, refreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { accessToken } = await getTokens();
        setIsAuthenticated(!!accessToken);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = async (accessToken: string, refreshToken: string) => {
    await storeTokens(accessToken, refreshToken);
    setIsAuthenticated(true);
  };

  const signOut = async () => {
    await clearTokens();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

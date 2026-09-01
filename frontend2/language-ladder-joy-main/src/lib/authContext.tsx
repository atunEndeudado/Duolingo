import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AuthService } from "@/services/authService";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount (client-side only)
  useEffect(() => {
    const savedToken = AuthService.getToken();
    if (savedToken) {
      setToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const newToken = await AuthService.login(email, password);
      AuthService.setToken(newToken);
      setToken(newToken);
      toast.success("Sesión iniciada");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al iniciar sesión";
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setToken(null);
    toast.success("Sesión cerrada");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  // Return safe defaults if not in provider (e.g., during SSR)
  if (!context) {
    return {
      token: null,
      isAuthenticated: false,
      isLoading: true,
      login: async () => {
        throw new Error("useAuth must be used within AuthProvider");
      },
      logout: () => {
        throw new Error("useAuth must be used within AuthProvider");
      },
    };
  }
  
  return context;
}

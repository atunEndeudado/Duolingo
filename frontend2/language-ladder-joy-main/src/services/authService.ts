const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL ?? "http://127.0.0.1:8010/api";

interface LoginResponse {
  access_token: string;
  token_type: "bearer";
}

// Helper to check if we're on the client side
const isClient = () => typeof window !== "undefined" && typeof localStorage !== "undefined";

export class AuthService {
  static async login(email: string, password: string): Promise<string> {
    const res = await fetch(`${AUTH_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let message = res.statusText || "Error de autenticación";
      try {
        const data = await res.json();
        if (typeof data?.detail === "string") message = data.detail;
        else if (Array.isArray(data?.detail)) message = data.detail.map((d: any) => d.msg ?? d).join(", ");
        else if (data?.detail) message = String(data.detail);
      } catch {
        // noop
      }
      throw new Error(message);
    }

    const data = (await res.json()) as LoginResponse;
    return data.access_token;
  }

  static logout(): void {
    if (isClient()) {
      localStorage.removeItem("access_token");
    }
  }

  static getToken(): string | null {
    if (!isClient()) return null;
    return localStorage.getItem("access_token");
  }

  static setToken(token: string): void {
    if (isClient()) {
      localStorage.setItem("access_token", token);
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

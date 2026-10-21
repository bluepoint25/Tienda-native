import { cognitoConfig } from "../config";

export interface AuthUser {
  username: string;
  email?: string;
  isSignedIn: boolean;
  tokens?: {
    accessToken: string;
    idToken: string;
    refreshToken?: string;
  };
}

interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

class AuthService {
  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const params = new URLSearchParams({
        grant_type: "password",
        client_id: cognitoConfig.clientId,
        username: email,
        password: password,
        scope: "openid email profile",
      });

      const response = await fetch(cognitoConfig.tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error_description || error.error || "Login failed"
        );
      }

      const data = (await response.json()) as TokenResponse;

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("id_token", data.id_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      localStorage.setItem("username", email);
      localStorage.setItem("token_expires_at",
        (Date.now() + data.expires_in * 1000).toString()
      );

      return {
        username: email,
        isSignedIn: true,
        tokens: {
          accessToken: data.access_token,
          idToken: data.id_token,
          refreshToken: data.refresh_token,
        },
      };
    } catch (err) {
      throw err;
    }
  }

  logout(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    localStorage.removeItem("token_expires_at");
  }

  getCurrentUser(): AuthUser | null {
    const username = localStorage.getItem("username");
    const accessToken = localStorage.getItem("access_token");

    if (username && accessToken) {
      return {
        username,
        isSignedIn: true,
        tokens: {
          accessToken,
          idToken: localStorage.getItem("id_token") || "",
          refreshToken: localStorage.getItem("refresh_token") || undefined,
        },
      };
    }

    return null;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem("access_token");
    const expiresAt = localStorage.getItem("token_expires_at");

    if (!token || !expiresAt) {
      return false;
    }

    return Date.now() < parseInt(expiresAt);
  }

  getAccessToken(): string | null {
    if (this.isAuthenticated()) {
      return localStorage.getItem("access_token");
    }
    return null;
  }

  async refreshAccessToken(): Promise<string> {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const params = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: cognitoConfig.clientId,
        refresh_token: refreshToken,
      });

      const response = await fetch(cognitoConfig.tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = (await response.json()) as TokenResponse;

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("id_token", data.id_token);
      localStorage.setItem("token_expires_at",
        (Date.now() + data.expires_in * 1000).toString()
      );

      return data.access_token;
    } catch (err) {
      this.logout();
      throw err;
    }
  }
}

export const authService = new AuthService();

import React, { createContext, useCallback, useEffect, useState } from "react";
import { AuthService, type LoginResponse, type MfaFactor, type UnenrollMfaResponse } from "../services/auth.service";
import type { UserDTO } from "@/cases/users/dtos/user.dto";
import type { AuthDTO } from "../dtos/auth.dto";

type AuthState = {
  user: UserDTO | null;
  token: string | null;
  isMfaRequired: boolean;
  factorId?: string;
  loading: boolean;
};

type AuthContextType = {
  user: UserDTO | null;
  token: string | null;
  isAuthenticated: boolean;
  factorId?: string;
  error?: string;
  isMfaRequired: boolean;
  loading: boolean;
  login: (credentials: AuthDTO) => Promise<LoginResponse>;
  verifyMfa: (factorId: string, code: string) => Promise<void>;
  enrollMfa: () => Promise<{ qrCode: string; secret: string; factorId: string }>;
  unenrollMfa: (factorId: string) => Promise<UnenrollMfaResponse>;
  listMfaFactors: () => Promise<MfaFactor[]>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isMfaRequired: false,
    loading: false,
  });

  // Carrega token armazenado
  useEffect(() => {
    const stored = localStorage.getItem("auth");

    if (stored) {
      const { user, token } = JSON.parse(stored);
      setAuthState((state) => ({ ...state, user, token }));
    }
  }, []);

  // login inicial → pode exigir MFA
  const login = async (credentials: AuthDTO) => {
    setAuthState((state) => ({ ...state, loading: true }));

    try {
      const res = await AuthService.login(credentials);

      if ("isMfaValidated" in res && !res.isMfaValidated) {
        // precisa de MFA
        setAuthState((state) => ({
          ...state,
          user: res.user,
          isMfaRequired: true,
          factorId: res.factorId,
          loading: false,
        }));
        return res;
      }

      // login completo
      setAuthState({
        user: res.user,
        token: res.token,
        isMfaRequired: false,
        loading: false,
      });

      localStorage.setItem("auth", JSON.stringify({ user: res.user, token: res.token }));

      return res;
    } catch (err) {
      console.error("Login failed", err);
      setAuthState((state) => ({ ...state, loading: false }));
      setError("Falha no login. Verifique suas credenciais.");
      throw err;
    }
  };

  // valida o código MFA
  const verifyMfa = async (factorId: string, code: string) => {
    if (!factorId) {
      throw new Error("factorId não definido");
    }

    setAuthState((state) => ({ ...state, loading: true }));

    try {
      const res = await AuthService.verifyMfa({
        factorId,
        code,
      });

      localStorage.setItem("auth", JSON.stringify({ user: res.user, token: res.token }));

      setAuthState({
        user: res.user,
        token: res.token,
        isMfaRequired: false,
        loading: false,
      });
    } catch (err) {
      setAuthState((s) => ({ ...s, loading: false }));
      throw err;
    }
  };

  // gera o qrcode para configurar MFA
  const enrollMfa = useCallback(async () => {
    return await AuthService.enrollMfa();
  }, []);

  // remove caso necessario
  const unenrollMfa = useCallback(async (factorId: string) => {
    return await AuthService.unenrollMfa({ factorId });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth');
    setAuthState({
      user: null,
      token: null,
      isMfaRequired: false,
      loading: false,
    });
  }, []);


  async function listMfaFactors(): Promise<MfaFactor[]> {
    return await AuthService.listMfaFactors();
  }

  const value: AuthContextType = {
    user: authState.user,
    token: authState.token,
    isAuthenticated: !!authState.token,
    isMfaRequired: authState.isMfaRequired,
    factorId: authState.factorId,
    loading: authState.loading,
    login,
    verifyMfa,
    enrollMfa,
    unenrollMfa,
    listMfaFactors,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
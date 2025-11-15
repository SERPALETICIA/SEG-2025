import type { UserDTO } from "@/cases/users/dtos/user.dto";
import { api } from "@/lib/axios";
import type { AuthDTO } from "@/cases/auth/dtos/auth.dto";

const _ENDPOINT = "/auth";

export type LoginMfaRequired = {
  user: UserDTO;
  isMfaValidated: false;
  factorId: string;
};

export type LoginSuccess = {
  user: UserDTO;
  token: string;
  isMfaValidated: true;
};

export type MfaFactor = {
  id: string;
  type: string;
  name: string;
  status: string;
}

export type SupabaseUser = {
  id: string;
  type: string;
  name: string;
  status: string;
}

export type LoginResponse = LoginMfaRequired | LoginSuccess;

export type VerifyMfaResponse = {
  user: UserDTO;
  token: string;
  isMfaValidated: true;
};

export type EnrollMfaResponse = {
  qrCode: string; // base64 or data URI (conforme backend)
  secret: string;
  factorId: string;
};

export type UnenrollMfaResponse = {
  success: boolean;
};

export const AuthService = {
  // se hasMFA = true: retorna { user, token, isMfaValidated: false, factorId }
  // se sem MFA: retorna { user, token, isMfaValidated: true }
  async login(credential: AuthDTO): Promise<LoginResponse> {
    try {
      const res = await api.post(`${_ENDPOINT}/login`, credential);
      return res.data as LoginResponse;
    } catch (err: any) {
      throw err;
    }
  },

  // verifica o código MFA
  async verifyMfa(payload: { factorId: string; code: string }): Promise<VerifyMfaResponse> {
    try {
      const res = await api.post(`${_ENDPOINT}/mfa/verify`, payload);
      return res.data as VerifyMfaResponse;
    } catch (err: any) {
      throw err;
    }
  },

  // gera QR code e secret
  async enrollMfa(): Promise<EnrollMfaResponse> {
    try {
      const res = await api.post(`${_ENDPOINT}/mfa/enroll`);
      return res.data as EnrollMfaResponse;
    } catch (err: any) {
      throw err;
    }
  },

  // remove o fator MFA
  async unenrollMfa(payload: { factorId: string }): Promise<UnenrollMfaResponse> {
    try {
      const res = await api.delete(`${_ENDPOINT}/mfa/unenroll`, { data: payload });
      return res.data as UnenrollMfaResponse;
    } catch (err: any) {
      throw err;
    }
  },

  async listMfaFactors(): Promise<MfaFactor[]> {
    try {
      const res = await api.get(`${_ENDPOINT}/mfa/factors`);
      return res.data as MfaFactor[];
    } catch (err: any) {
      throw err;
    }
  },

  // usar em algum lugar caso queira exibir o nome por exemplo do usuario logado
  async getSupabaseUser(): Promise<SupabaseUser> {
    try {
      const res = await api.get(`${_ENDPOINT}/auth/me`);
      return res.data as SupabaseUser;
    } catch (err: any) {
      throw err;
    }
  }
};
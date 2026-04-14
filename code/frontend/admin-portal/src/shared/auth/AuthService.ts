import type { StorageScope } from "@/domain/entities/role.entity";
import { AxiosMethod } from "@/infrastructure/lib/axios/method";
import request from "@/infrastructure/lib/axios/request";

export type AuthProfile = {
  email: string;
  id: string;
  permissions: string[];
  roles: string[];
  routes: string[];
  storageScopes: StorageScope[];
};

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignInResponse = {
  message: string;
  success: boolean;
  user: AuthProfile;
};

export type LogoutResponse = {
  message: string;
  success: boolean;
};

export type RefreshResponse = {
  message: string;
  success: boolean;
  user: AuthProfile;
};

const AuthService = {
  signIn: (payload: SignInPayload) =>
    request({
      url: "/auth/login",
      method: AxiosMethod.POST,
      data: payload,
    }) as Promise<SignInResponse>,
  me: () =>
    request({
      url: "/auth/me",
      method: AxiosMethod.GET,
    }) as Promise<AuthProfile>,
  refresh: () =>
    request({
      url: "/auth/refresh-token",
      method: AxiosMethod.POST,
    }) as Promise<RefreshResponse>,
  logout: () =>
    request({
      url: "/auth/logout",
      method: AxiosMethod.POST,
    }) as Promise<LogoutResponse>,
};

export default AuthService;

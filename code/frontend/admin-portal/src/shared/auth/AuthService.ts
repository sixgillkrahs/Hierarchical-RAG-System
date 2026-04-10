import { AxiosMethod } from "../../lib/axios/method";
import request from "../../lib/axios/request";

export type AuthProfile = {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  routes: string[];
};

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignInResponse = {
  success: boolean;
  message: string;
  user: AuthProfile;
};

export type LogoutResponse = {
  success: boolean;
  message: string;
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
  logout: () =>
    request({
      url: "/auth/logout",
      method: AxiosMethod.POST,
    }) as Promise<LogoutResponse>,
};

export default AuthService;

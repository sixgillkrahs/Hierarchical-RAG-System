import { AxiosMethod } from "../../lib/axios/method";
import request from "../../lib/axios/request";

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignInResponse = {
  success?: boolean;
  message?: string;
  accessToken?: string;
};

const AuthService = {
  signIn: (payload: SignInPayload) =>
    request({
      url: "/auth/login",
      method: AxiosMethod.POST,
      data: payload,
    }) as Promise<SignInResponse>,
};

export default AuthService;

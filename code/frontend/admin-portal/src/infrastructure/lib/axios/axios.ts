import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { setAuthSession } from "@/shared/auth/auth-session";
import { queryClient } from "@/shared/query/queryClient";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let isRefreshing = false;
let refreshBlocked = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];
const LOGIN_PATH = "/auth/login";
const REFRESH_PATH = "/auth/refresh-token";
const LOGOUT_PATH = "/auth/logout";
const SIGN_IN_PATH = "/auth/sign-in";
const SKIP_REFRESH_PATHS = [LOGIN_PATH, REFRESH_PATH, LOGOUT_PATH];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(true);
  });
  failedQueue = [];
};

const clearClientSession = () => {
  setAuthSession(queryClient, null);
};

const redirectToSignIn = () => {
  if (window.location.pathname !== SIGN_IN_PATH) {
    window.location.href = SIGN_IN_PATH;
  }
};

const refreshAuthToken = async () => {
  const baseURL = import.meta.env.VITE_BASEURL as string | undefined;

  return axios.post(
    `${baseURL ?? ""}/auth/refresh-token`,
    {},
    {
      withCredentials: true,
      headers: {
        Accept: "application/json, text/plain, */*",
        "X-Auth-App": "uaa",
      },
    },
  );
};

export const client = (() => {
  return axios.create({
    baseURL: import.meta.env.VITE_BASEURL,
    headers: {
      Accept: "application/json, text/plain, */*",
      "X-Auth-App": "uaa",
    },
    withCredentials: true, // bật cái này nếu ở backend có bật cờ Access-Control-Allow-Credentials: true
  });
})();

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

client.interceptors.response.use(
  (res: AxiosResponse) => {
    const requestUrl = res.config.url ?? "";

    if (requestUrl.includes(LOGIN_PATH) || requestUrl.includes(REFRESH_PATH)) {
      refreshBlocked = false;
    }

    if (requestUrl.includes(LOGOUT_PATH)) {
      refreshBlocked = true;
      clearClientSession();
    }

    return res;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url ?? "";

    if (SKIP_REFRESH_PATHS.some((path) => requestUrl.includes(path))) {
      if (requestUrl.includes(REFRESH_PATH) && status === 401) {
        refreshBlocked = true;
        clearClientSession();
      }
      return Promise.reject(error);
    }

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !refreshBlocked
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(client(originalRequest)),
            reject,
          });
        });
      }
      isRefreshing = true;
      try {
        const resp = await refreshAuthToken();

        if (!resp?.data?.success) {
          throw new Error("Refresh token failed");
        }

        processQueue(null);
        return client(originalRequest);
      } catch (err) {
        refreshBlocked = true;
        clearClientSession();
        processQueue(err);
        redirectToSignIn();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 401) {
      clearClientSession();
    }

    if (status === 403 && error.response?.data) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject(error);
  },
);

import {
  queryOptions,
  type QueryClient,
  useQuery,
} from "@tanstack/react-query";
import AuthService, { type AuthProfile } from "./AuthService";

export const AUTH_SESSION_QUERY_KEY = ["auth", "session"] as const;

const isUnauthorizedAuthError = (error: unknown) => {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return false;
  }

  const response = error.response;

  if (
    typeof response !== "object" ||
    response === null ||
    !("status" in response)
  ) {
    return false;
  }

  return response.status === 401;
};

const fetchAuthSession = async (): Promise<AuthProfile | null> => {
  try {
    return await AuthService.me();
  } catch (error) {
    if (isUnauthorizedAuthError(error)) {
      return null;
    }

    throw error;
  }
};

export const authSessionQueryOptions = queryOptions({
  queryKey: AUTH_SESSION_QUERY_KEY,
  queryFn: fetchAuthSession,
  retry: false,
  staleTime: 1000 * 60 * 5,
});

export const getAuthSession = (
  client: QueryClient,
  options?: {
    suppressErrors?: boolean;
  },
) => {
  if (options?.suppressErrors) {
    return client.ensureQueryData(authSessionQueryOptions).catch(() => null);
  }

  return client.ensureQueryData(authSessionQueryOptions);
};

export const setAuthSession = (
  client: QueryClient,
  session: AuthProfile | null,
) => {
  client.setQueryData(AUTH_SESSION_QUERY_KEY, session);
};

export const useAuthSession = () => useQuery(authSessionQueryOptions);

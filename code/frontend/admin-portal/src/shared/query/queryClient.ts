import {
  Mutation,
  MutationCache,
  Query,
  QueryCache,
  QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const shouldShowErrorSource = import.meta.env.ENVIRONMENT === "development";

const formatErrorMessage = (errorSource: string, errorMessage: string) =>
  shouldShowErrorSource ? `${errorSource}: ${errorMessage}` : errorMessage;

const hasResponseStatus = (
  error: unknown,
): error is { response: { status: number } } => {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return false;
  }

  const response = error.response;

  return (
    typeof response === "object" &&
    response !== null &&
    "status" in response &&
    typeof response.status === "number"
  );
};

const hasErrorCode = (
  error: unknown,
): error is {
  code: string;
} => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10000 * 3,
    },
  },
  queryCache: new QueryCache({
    onSuccess: (
      _data: unknown,
      query: Query<unknown, unknown, unknown, QueryKey>,
    ): void => {
      if (query.meta?.SUCCESS_MESSAGE) {
        toast.success(String(query.meta.SUCCESS_MESSAGE));
      }
    },
    onError: (
      error: unknown,
      query: Query<unknown, unknown, unknown, QueryKey>,
    ): void => {
      if (axios.isAxiosError(error) && query.meta?.ERROR_SOURCE) {
        const message = formatErrorMessage(
          String(query.meta.ERROR_SOURCE),
          error.response?.data?.message || error.message,
        );
        toast.error(message);
        console.error(message);
      } else if (error instanceof Error && query.meta?.ERROR_SOURCE) {
        const message = formatErrorMessage(String(query.meta.ERROR_SOURCE), error.message);
        toast.error(message);
        console.error(message);
      } else if (hasResponseStatus(error) && error.response.status === 404) {
        toast.error(`${(error as any)?.response?.data?.message}`);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (
      error: unknown,
      _variables: unknown,
      _context: unknown,
      mutation: Mutation<unknown, unknown, unknown, unknown>,
    ): void => {
      if (axios.isAxiosError(error) && mutation.meta?.ERROR_SOURCE) {
        toast.error(
          formatErrorMessage(
            String(mutation.meta.ERROR_SOURCE),
            error.response?.data?.message || error.message,
          ),
        );
      } else if (error instanceof Error && mutation.meta?.ERROR_SOURCE) {
        toast.error(
          formatErrorMessage(String(mutation.meta.ERROR_SOURCE), error.message),
        );
      } else if (
        hasErrorCode(error) &&
        error.code === "ERR_BAD_REQUEST" &&
        mutation.meta?.ERROR_SOURCE
      ) {
        toast.error(
          formatErrorMessage(
            String(mutation.meta.ERROR_SOURCE),
            "Bad request",
          ),
        );
      }
    },
    onSuccess: (
      _data: unknown,
      _variables: unknown,
      _context: unknown,
      mutation: Mutation<unknown, unknown, unknown, unknown>,
    ): void => {
      if (mutation.meta?.SUCCESS_MESSAGE) {
        toast.success(String(mutation.meta.SUCCESS_MESSAGE));
      }
    },
  }),
});

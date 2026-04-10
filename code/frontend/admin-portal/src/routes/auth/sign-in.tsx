import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAuthSession } from "@/shared/auth/auth-session";
import { getFirstAccessibleRoute } from "@/shared/auth/route-access";
import { queryClient } from "@/shared/query/queryClient";
import SignInPage from "@/presentation/components/modules/sign-in";

export const Route = createFileRoute("/auth/sign-in")({
  beforeLoad: async () => {
    const session = await getAuthSession(queryClient, {
      suppressErrors: true,
    });
    if (session) {
      const destination = getFirstAccessibleRoute(session.routes) ?? "/";

      throw redirect({
        to: destination,
      });
    }
  },
  component: SignInPage,
});

import { createFileRoute, redirect } from "@tanstack/react-router";
import SignInPage from "../../components/modules/sign-in";
import { getAuthSession } from "../../shared/auth/auth-session";
import { queryClient } from "../../shared/query/queryClient";

export const Route = createFileRoute("/auth/sign-in")({
  beforeLoad: async () => {
    const session = await getAuthSession(queryClient, {
      suppressErrors: true,
    });
    console.log(session);
    if (session) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: SignInPage,
});

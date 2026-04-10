import { createFileRoute, redirect } from "@tanstack/react-router";
import Roles from "@/presentation/components/modules/roles";
import { getAuthSession } from "@/shared/auth/auth-session";
import {
  getFirstAccessibleRoute,
  hasRouteAccess,
} from "@/shared/auth/route-access";
import { queryClient } from "@/shared/query/queryClient";

export const Route = createFileRoute("/_main/roles")({
  beforeLoad: async () => {
    const session = await getAuthSession(queryClient, {
      suppressErrors: true,
    });

    if (!session) {
      throw redirect({ to: "/auth/sign-in" });
    }

    if (!hasRouteAccess(session.routes, "/roles")) {
      throw redirect({
        to: getFirstAccessibleRoute(session.routes) ?? "/auth/sign-in",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Roles />;
}

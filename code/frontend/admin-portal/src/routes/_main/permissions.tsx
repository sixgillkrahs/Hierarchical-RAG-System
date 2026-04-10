import Permissions from "@/presentation/components/modules/permissions";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAuthSession } from "@/shared/auth/auth-session";
import {
  getFirstAccessibleRoute,
  hasRouteAccess,
} from "@/shared/auth/route-access";
import { queryClient } from "@/shared/query/queryClient";

export const Route = createFileRoute("/_main/permissions")({
  beforeLoad: async () => {
    const session = await getAuthSession(queryClient, {
      suppressErrors: true,
    });

    if (!session) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }

    if (!hasRouteAccess(session.routes, "/permissions")) {
      throw redirect({
        to: getFirstAccessibleRoute(session.routes) ?? "/auth/sign-in",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Permissions />;
}

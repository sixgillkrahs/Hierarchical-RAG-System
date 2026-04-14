import Files from "@/presentation/components/modules/files";
import { getAuthSession } from "@/shared/auth/auth-session";
import { queryClient } from "@/shared/query/queryClient";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/files")({
  beforeLoad: async () => {
    const session = await getAuthSession(queryClient, {
      suppressErrors: true,
    });

    if (!session) {
      throw redirect({ to: "/auth/sign-in" });
    }

    const canAccessFiles =
      session.permissions.includes("storage.read") ||
      session.permissions.includes("storage.manage");

    if (!canAccessFiles) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Files />;
}

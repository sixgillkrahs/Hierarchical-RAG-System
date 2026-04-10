import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import MainLayout from "@/presentation/components/layouts/main-layout";
import { getAuthSession } from "../shared/auth/auth-session";
import { queryClient } from "../shared/query/queryClient";

export const Route = createFileRoute("/_main")({
  beforeLoad: async () => {
    const session = await getAuthSession(queryClient);

    if (!session) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }
  },
  component: MainLayoutRoute,
});

function MainLayoutRoute() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

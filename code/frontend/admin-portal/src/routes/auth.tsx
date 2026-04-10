import { Outlet, createFileRoute } from "@tanstack/react-router";
import AuthLayout from "@/presentation/components/layouts/auth-layout";

export const Route = createFileRoute("/auth")({
  component: AuthLayoutRoute,
});

function AuthLayoutRoute() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}

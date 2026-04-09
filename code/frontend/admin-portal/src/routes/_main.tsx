import { Outlet, createFileRoute } from "@tanstack/react-router";
import MainLayout from "../components/layouts/main-layout";

export const Route = createFileRoute("/_main")({
  component: MainLayoutRoute,
});

function MainLayoutRoute() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

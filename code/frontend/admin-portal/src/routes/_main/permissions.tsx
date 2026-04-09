import Permissions from "@/components/modules/permissions";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/permissions")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Permissions />;
}

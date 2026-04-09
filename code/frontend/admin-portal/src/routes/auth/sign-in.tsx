import { createFileRoute } from "@tanstack/react-router";
import SignInPage from "../../components/modules/sign-in";

export const Route = createFileRoute("/auth/sign-in")({
  component: SignInPage,
});

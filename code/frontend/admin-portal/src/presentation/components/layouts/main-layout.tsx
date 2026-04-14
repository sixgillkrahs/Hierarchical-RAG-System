import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { FileArchive, KeyRound, LogOut, ShieldCheck, UserCog } from "lucide-react";
import { startTransition, type ReactNode, useState } from "react";
import { toast } from "sonner";

import { TooltipProvider } from "../ui/tooltip";
import { Button } from "../ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "../ui/sidebar";
import { setAuthSession, useAuthSession } from "@/shared/auth/auth-session";
import { hasRouteAccess } from "@/shared/auth/route-access";
import AuthService from "@/shared/auth/AuthService";
import { queryClient } from "@/shared/query/queryClient";

type MainLayoutProps = {
  children: ReactNode;
};

function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { data: session } = useAuthSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigationItems = [
    {
      to: "/users",
      label: "Users",
      icon: UserCog,
    },
    {
      to: "/roles",
      label: "Roles",
      icon: ShieldCheck,
    },
    {
      to: "/permissions",
      label: "Permissions",
      icon: KeyRound,
    },
  ] as const;

  const fileItems = [
    {
      to: "/files",
      label: "Files",
      icon: FileArchive,
    },
  ] as const;

  const visibleNavigationItems = navigationItems.filter((item) =>
    hasRouteAccess(session?.routes, item.to),
  );
  const visibleFileItems = fileItems.filter(() =>
    session?.permissions?.includes("storage.read") ||
    session?.permissions?.includes("storage.manage"),
  );

  const sectionLabel =
    pathname === "/"
      ? "Access overview"
      : pathname.startsWith("/users")
        ? "User management"
        : pathname.startsWith("/roles")
          ? "Role management"
          : pathname.startsWith("/permissions")
            ? "Permission management"
            : pathname.startsWith("/files")
              ? "Document storage"
              : "Internal portal";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    let didLogout = false;

    try {
      const response = await AuthService.logout();
      didLogout = true;
      toast.success("Signed out", {
        description: response.message,
      });
    } catch (error) {
      toast.error("Sign-out failed", {
        description:
          error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsLoggingOut(false);
      if (didLogout) {
        setAuthSession(queryClient, null);
        startTransition(() => {
          void navigate({ to: "/auth/sign-in" });
        });
      }
    }
  };

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen>
        <Sidebar variant="inset" collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Storage</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleFileItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.to ||
                      pathname.startsWith(`${item.to}/`);
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                          size="lg"
                        >
                          <Link to={item.to}>
                            <Icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleNavigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.to ||
                      pathname.startsWith(`${item.to}/`);
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                          size="lg"
                        >
                          <Link to={item.to}>
                            <Icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border/60 bg-background/85 px-4 backdrop-blur md:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Admin Portal
                </p>
                <p className="text-sm font-medium text-foreground">
                  {sectionLabel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-foreground">
                  {session?.email ?? "Authenticated user"}
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {session?.roles?.[0] ?? "role-based session"}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="size-4" />
                {isLoggingOut ? "Signing out..." : "Logout"}
              </Button>
            </div>
          </header>

          <main className="min-w-0 px-5 py-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

export default MainLayout;

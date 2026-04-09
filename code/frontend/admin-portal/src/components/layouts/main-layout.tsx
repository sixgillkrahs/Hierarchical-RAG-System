import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowUpRight,
  KeyRound,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { startTransition, type ReactNode, useState } from "react";
import { toast } from "sonner";
import AuthService from "../../shared/auth/AuthService";
import {
  setAuthSession,
  useAuthSession,
} from "../../shared/auth/auth-session";
import { queryClient } from "../../shared/query/queryClient";
import { Button } from "../ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "../ui/sidebar";

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
      label: "User management",
      icon: UserCog,
    },
    {
      to: "/roles",
      label: "Role management",
      icon: ShieldCheck,
    },
    {
      to: "/permissions",
      label: "Permission management",
      icon: KeyRound,
    },
  ] as const;

  const sectionLabel =
    pathname === "/"
      ? "Access overview"
      : pathname.startsWith("/users")
        ? "User management"
        : pathname.startsWith("/roles")
          ? "Role management"
          : pathname.startsWith("/permissions")
            ? "Permission management"
            : "RBAC workspace";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    let didLogout = false;

    try {
      const response = await AuthService.logout();
      didLogout = true;
      toast.success("Logout successful", {
        description: response.message,
      });
    } catch (error) {
      toast.error("Logout failed", {
        description:
          error instanceof Error ? error.message : "Unable to sign out.",
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
    <SidebarProvider defaultOpen>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="gap-3 p-3">
          <Link
            to="/"
            className="rounded-3xl border border-sidebar-border/70 bg-sidebar px-4 py-4 shadow-sm transition hover:border-sidebar-primary/20 hover:bg-sidebar-accent"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sidebar-foreground/60">
              Hierarchical RAG
            </p>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-lg font-semibold tracking-tight text-sidebar-foreground">
                  RBAC Control
                </p>
                <p className="mt-1 text-sm leading-6 text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
                  Role-based access management for the admin portal.
                </p>
              </div>
              <LayoutDashboard className="mt-0.5 shrink-0 text-sidebar-primary" />
            </div>
          </Link>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.to || pathname.startsWith(`${item.to}/`);

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

        <SidebarFooter className="p-3 pt-0">
          <div className="rounded-3xl border border-dashed border-sidebar-border/80 bg-sidebar-accent/35 px-4 py-4 text-sm text-sidebar-foreground/80 group-data-[collapsible=icon]:hidden">
            <p className="font-medium text-sidebar-foreground">
              Role-based rollout
            </p>
            <p className="mt-2 leading-6">
              Align role bundles and permission ownership before publishing
              policy changes.
            </p>
            <Link
              to="/permissions"
              className="mt-3 inline-flex items-center gap-1 font-semibold text-sidebar-primary"
            >
              Open permission matrix
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </SidebarFooter>

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
              <p className="text-sm font-medium text-foreground">{sectionLabel}</p>
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
  );
}

export default MainLayout;

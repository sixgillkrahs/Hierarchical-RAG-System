import { createFileRoute, redirect } from "@tanstack/react-router";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { getAuthSession } from "../../shared/auth/auth-session";
import {
  getFirstAccessibleRoute,
  hasRouteAccess,
} from "../../shared/auth/route-access";
import { queryClient } from "../../shared/query/queryClient";

export const Route = createFileRoute("/_main/roles")({
  beforeLoad: async () => {
    const session = await getAuthSession(queryClient, {
      suppressErrors: true,
    });

    if (!session) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }

    if (!hasRouteAccess(session.routes, "/roles")) {
      throw redirect({
        to: getFirstAccessibleRoute(session.routes) ?? "/auth/sign-in",
      });
    }
  },
  component: RouteComponent,
});

const roles = [
  {
    name: "Platform Admin",
    members: 8,
    permissions: 42,
    scope: "Critical",
    scopeVariant: "destructive" as const,
    summary: "Toàn quyền trên user lifecycle, policy publish và audit export.",
  },
  {
    name: "Org Manager",
    members: 17,
    permissions: 18,
    scope: "Elevated",
    scopeVariant: "warning" as const,
    summary: "Quản lý user nội bộ, phân công team và revoke access theo bộ phận.",
  },
  {
    name: "Support Lead",
    members: 21,
    permissions: 14,
    scope: "Operational",
    scopeVariant: "secondary" as const,
    summary: "Xử lý ticket, xem user profile và yêu cầu cấp quyền nhạy cảm thông qua approval.",
  },
  {
    name: "Vendor Readonly",
    members: 12,
    permissions: 6,
    scope: "Restricted",
    scopeVariant: "outline" as const,
    summary: "Chỉ đọc dashboard và dữ liệu audit đã ẩn thông tin nhạy cảm.",
  },
] as const;

const featuredRolePermissions = [
  "manage_users",
  "assign_roles",
  "publish_policy",
  "review_audit_log",
  "export_sensitive_data",
] as const;

const workflow = [
  "Tạo role theo capability, không tạo theo tên người.",
  "Gắn permission theo bundle có chủ sở hữu rõ ràng.",
  "Luôn có sandbox/staging role trước khi publish.",
  "Chỉ merge khi matrix, owner và audit trail cùng hợp lệ.",
] as const;

function RouteComponent() {
  return (
    <section className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-primary/10 bg-[linear-gradient(145deg,rgba(120,83,32,0.08),rgba(255,255,255,0.82))]">
          <CardHeader className="space-y-4">
            <Badge className="w-fit" variant="secondary">
              Role catalog
            </Badge>
            <div className="space-y-3">
              <CardTitle className="text-5xl leading-tight text-balance">
                Xây role như một sản phẩm: rõ mục đích, rõ chủ sở hữu, rõ phạm vi.
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-8">
                Trang này tổ chức role theo bundle nghiệp vụ để bạn theo dõi số user,
                độ nhạy cảm và vòng đời phê duyệt của từng nhóm quyền.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button size="lg">Tạo role mới</Button>
            <Button size="lg" variant="outline">
              Nhân bản role bundle
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vai trò đang được tập trung kiểm soát</CardTitle>
            <CardDescription>
              Một role nổi bật nên có bản mô tả, module ảnh hưởng và checklist rollout riêng.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.75rem] border border-border/70 bg-background/70 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-2xl font-semibold">Platform Admin</p>
                <Badge variant="destructive">Critical</Badge>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Role này là bundle nhạy cảm nhất, cần policy versioning, 2-step approval
                và quarterly review bắt buộc.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {featuredRolePermissions.map((permission) => (
                  <Badge key={permission} variant="outline">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Danh mục vai trò</CardTitle>
            <CardDescription>
              Mỗi card đóng vai trò như một entry point để nối vào màn hình chi tiết role sau này.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {roles.map((role) => (
              <div
                key={role.name}
                className="rounded-[1.75rem] border border-border/70 bg-background/65 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold">{role.name}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {role.summary}
                    </p>
                  </div>
                  <Badge variant={role.scopeVariant}>{role.scope}</Badge>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border/70 bg-card/70 p-3">
                    <p className="text-sm text-muted-foreground">Members</p>
                    <p className="mt-1 text-2xl font-semibold">{role.members}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-card/70 p-3">
                    <p className="text-sm text-muted-foreground">Permissions</p>
                    <p className="mt-1 text-2xl font-semibold">{role.permissions}</p>
                  </div>
                </div>
                <div className="mt-5 flex gap-2">
                  <Button variant="outline">Xem matrix</Button>
                  <Button>Chỉnh sửa</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow quản trị role</CardTitle>
            <CardDescription>
              Các bước nên xuất hiện rõ trong UI để người dùng không tạo role tùy tiện.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {workflow.map((step, index) => (
              <div
                key={step}
                className="flex gap-4 rounded-[1.5rem] border border-border/70 bg-background/65 p-4"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {index + 1}
                </div>
                <p className="pt-1 text-sm leading-7">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

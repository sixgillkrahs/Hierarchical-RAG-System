import { createFileRoute, redirect } from "@tanstack/react-router";
import { Badge } from "@/presentation/components/ui/badge";
import { Button } from "@/presentation/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { Input } from "@/presentation/components/ui/input";
import { getAuthSession } from "@/shared/auth/auth-session";
import {
  getFirstAccessibleRoute,
  hasRouteAccess,
} from "@/shared/auth/route-access";
import { queryClient } from "@/shared/query/queryClient";

export const Route = createFileRoute("/_main/users")({
  beforeLoad: async () => {
    const session = await getAuthSession(queryClient, {
      suppressErrors: true,
    });

    if (!session) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }

    if (!hasRouteAccess(session.routes, "/users")) {
      throw redirect({
        to: getFirstAccessibleRoute(session.routes) ?? "/auth/sign-in",
      });
    }
  },
  component: RouteComponent,
});

const userStats = [
  {
    label: "Tài khoản nội bộ",
    value: "146",
    detail: "12 tài khoản mới trong 30 ngày",
  },
  {
    label: "Vendor access",
    value: "18",
    detail: "4 tài khoản hết hạn trong tuần này",
  },
  {
    label: "Quyền cần review",
    value: "11",
    detail: "Chưa hoàn tất quarterly review",
  },
] as const;

const users = [
  {
    name: "Nguyen Minh Chau",
    email: "chau.nguyen@company.com",
    roles: ["Platform Admin", "Billing Approver"],
    status: "Active",
    statusVariant: "success" as const,
    risk: "High",
    riskVariant: "destructive" as const,
    review: "2 ngày trước",
  },
  {
    name: "Tran Bao Linh",
    email: "linh.tran@company.com",
    roles: ["Support Lead"],
    status: "Review due",
    statusVariant: "warning" as const,
    risk: "Medium",
    riskVariant: "warning" as const,
    review: "31 ngày trước",
  },
  {
    name: "Pham Huy",
    email: "huy.pham@vendor.io",
    roles: ["Vendor Readonly"],
    status: "Expiring",
    statusVariant: "warning" as const,
    risk: "Low",
    riskVariant: "secondary" as const,
    review: "7 ngày trước",
  },
  {
    name: "Hoang Thu Ha",
    email: "ha.hoang@company.com",
    roles: ["Org Manager", "Audit Reviewer"],
    status: "Active",
    statusVariant: "success" as const,
    risk: "Medium",
    riskVariant: "warning" as const,
    review: "1 ngày trước",
  },
] as const;

const approvalQueue = [
  "Cấp quyền export-users cho nhóm Support Lead",
  "Thu hồi role Billing Approver khỏi vendor ngoài",
  "Gia hạn quyền readonly cho đối tác kiểm toán",
] as const;

const assignmentFlow = [
  "Xác minh domain nghiệp vụ của người dùng",
  "Gán role bundle gần nhất với nhiệm vụ thực tế",
  "Gắn thời hạn với vendor hoặc tài khoản tạm thời",
  "Đẩy thay đổi vào audit trail và approval log",
] as const;

function RouteComponent() {
  return (
    <section className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-primary/10 bg-[linear-gradient(145deg,rgba(120,83,32,0.08),rgba(255,255,255,0.82))]">
          <CardHeader className="space-y-4">
            <Badge className="w-fit" variant="secondary">
              User access assignment
            </Badge>
            <div className="space-y-3">
              <CardTitle className="text-5xl leading-tight text-balance">
                Gán đúng vai trò cho đúng người, vào đúng thời điểm.
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-8">
                Màn hình này tập trung cho bài toán cấp quyền theo role bundle,
                quản lý user lifecycle và review định kỳ để tránh privilege
                creep.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button size="lg">Mời người dùng mới</Button>
              <Button size="lg" variant="outline">
                Xuất audit log
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {userStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.5rem] border border-border/70 bg-background/70 p-4"
                >
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {stat.detail}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Luồng cấp quyền đề xuất</CardTitle>
            <CardDescription>
              Mỗi request truy cập nên đi qua chuỗi bước giống nhau để UI dễ
              scale.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignmentFlow.map((step, index) => (
              <div
                key={step}
                className="flex gap-4 rounded-[1.5rem] border border-border/70 bg-background/65 p-4"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {index + 1}
                </div>
                <p className="pt-1 text-sm leading-7 text-foreground/85">
                  {step}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle>Danh sách user và role assignment</CardTitle>
                <CardDescription>
                  Dạng hiển thị này phù hợp để nối API danh sách người dùng và
                  thao tác gán role.
                </CardDescription>
              </div>
              <Input
                className="w-full max-w-sm"
                placeholder="Tìm theo email, role hoặc bộ phận"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {users.map((user) => (
              <div
                key={user.email}
                className="grid gap-4 rounded-[1.75rem] border border-border/70 bg-background/65 p-5 xl:grid-cols-[1.2fr_0.95fr_0.75fr_auto]"
              >
                <div>
                  <p className="text-lg font-semibold">{user.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Role bundle</p>
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((role) => (
                      <Badge key={role} variant="outline">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Risk / review</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={user.statusVariant}>{user.status}</Badge>
                    <Badge variant={user.riskVariant}>{user.risk}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Review gần nhất: {user.review}
                  </p>
                </div>

                <div className="flex flex-wrap items-start gap-2 xl:justify-end">
                  <Button variant="outline">Xem chi tiết</Button>
                  <Button>Gán lại role</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu chờ duyệt</CardTitle>
              <CardDescription>
                Các request nhạy cảm nên được gom về khu vực riêng để reviewer
                xử lý.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {approvalQueue.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-border/70 bg-background/65 p-4"
                >
                  <p className="text-sm leading-7">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quy tắc review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
              <p>
                Mọi tài khoản có role nhạy cảm cần owner phê duyệt trực tiếp.
              </p>
              <p>Vendor access phải có ngày hết hạn và scope rõ ràng.</p>
              <p>Role tạm thời cần được thu hồi tự động nếu quá hạn.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

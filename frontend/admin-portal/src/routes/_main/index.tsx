import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export const Route = createFileRoute("/_main/")({
  component: RouteComponent,
});

const overviewStats = [
  {
    label: "Vai trò đang hoạt động",
    value: "12",
    detail: "2 role mới chờ phê duyệt",
    icon: ShieldCheck,
  },
  {
    label: "Người dùng đã gán quyền",
    value: "184",
    detail: "11 tài khoản chưa review quý này",
    icon: UsersRound,
  },
  {
    label: "Policy drift",
    value: "03",
    detail: "Drift giữa staging và production",
    icon: ShieldAlert,
  },
  {
    label: "Audit events / 24h",
    value: "248",
    detail: "Tăng 17% so với hôm qua",
    icon: Activity,
  },
] as const;

const governancePillars = [
  {
    title: "Least privilege by default",
    description:
      "Mỗi role được cắt theo domain nghiệp vụ, chỉ cấp quyền đủ dùng cho từng luồng thao tác.",
  },
  {
    title: "Approval workflow rõ ràng",
    description:
      "Mọi thay đổi role bundle hoặc permission matrix phải đi qua người duyệt được chỉ định.",
  },
  {
    title: "Quarterly access review",
    description:
      "Tài khoản nội bộ, vendor và support đều có lịch review riêng để tránh quyền thừa.",
  },
] as const;

const rolloutChecklist = [
  { title: "Khóa nhóm quyền nhạy cảm", state: "Done", variant: "success" as const },
  { title: "So khớp role giữa các môi trường", state: "In review", variant: "warning" as const },
  { title: "Gắn audit trail cho revoke flow", state: "Planned", variant: "outline" as const },
  { title: "Chốt owner cho từng module", state: "Done", variant: "success" as const },
] as const;

const accessEvents = [
  {
    actor: "support.lead@company.com",
    action: "Yêu cầu cấp lại quyền export-users",
    scope: "User Directory",
    timestamp: "5 phút trước",
  },
  {
    actor: "platform.ops@company.com",
    action: "Phát hiện policy drift ở permission manage_roles",
    scope: "IAM Gateway",
    timestamp: "12 phút trước",
  },
  {
    actor: "auditor@company.com",
    action: "Hoàn tất review quý cho nhóm Vendor Access",
    scope: "Audit",
    timestamp: "34 phút trước",
  },
] as const;

function RouteComponent() {
  return (
    <section className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-primary/10 bg-[linear-gradient(145deg,rgba(120,83,32,0.08),rgba(255,255,255,0.82))]">
          <CardHeader className="space-y-4">
            <Badge className="w-fit" variant="secondary">
              RBAC overview
            </Badge>
            <div className="space-y-3">
              <CardTitle className="max-w-3xl text-5xl leading-tight text-balance">
                Thiết kế quyền truy cập có kiểm soát, đo được và sẵn sàng audit.
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-8">
                Màn hình tổng quan này gom các chỉ số cốt lõi để triển khai
                role-based access control: role catalog, user assignment,
                permission matrix và tình trạng drift giữa môi trường.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/users">Mở user assignment</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/permissions">Mở permission matrix</Link>
              </Button>
            </div>

            <div className="rounded-[1.75rem] border border-border/70 bg-background/75 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Rollout focus
                  </p>
                  <p className="mt-3 text-lg font-semibold">
                    Chuẩn hóa 4 nhóm role lõi trước khi mở self-service invite.
                  </p>
                </div>
                <ArrowUpRight className="mt-1 shrink-0 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          {overviewStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card key={stat.label}>
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <div className="rounded-full border border-border/70 bg-background/70 p-2">
                      <Icon className="size-4 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {stat.detail}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nguyên tắc thiết kế quyền</CardTitle>
            <CardDescription>
              Bộ nguyên tắc này giúp UI không chỉ đẹp mà còn bám sát luồng triển khai RBAC thật.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {governancePillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className="rounded-[1.5rem] border border-border/70 bg-background/65 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Trụ cột {index + 1}
                </p>
                <p className="mt-3 text-xl font-semibold">{pillar.title}</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {pillar.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklist triển khai</CardTitle>
            <CardDescription>
              Trạng thái các hạng mục cần chốt trước khi bật quyền trên production.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rolloutChecklist.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-border/70 bg-background/65 px-4 py-4"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                </div>
                <Badge variant={item.variant}>{item.state}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Access events gần nhất</CardTitle>
          <CardDescription>
            Log mẫu để bạn hình dung khu vực theo dõi thay đổi quyền và request nhạy cảm.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {accessEvents.map((event) => (
            <div
              key={`${event.actor}-${event.timestamp}`}
              className="grid gap-3 rounded-[1.5rem] border border-border/70 bg-background/65 p-5 md:grid-cols-[1.1fr_1.2fr_0.7fr_auto]"
            >
              <div>
                <p className="text-sm text-muted-foreground">Actor</p>
                <p className="mt-1 font-medium">{event.actor}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Action</p>
                <p className="mt-1 font-medium">{event.action}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scope</p>
                <p className="mt-1 font-medium">{event.scope}</p>
              </div>
              <div className="text-sm text-muted-foreground md:text-right">
                {event.timestamp}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

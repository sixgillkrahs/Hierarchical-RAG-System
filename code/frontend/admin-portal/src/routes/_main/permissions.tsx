import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export const Route = createFileRoute("/_main/permissions")({
  component: RouteComponent,
});

const permissionSets = [
  { label: "Permissions total", value: "64" },
  { label: "Sensitive actions", value: "11" },
  { label: "Modules covered", value: "09" },
] as const;

const matrixRows = [
  {
    module: "User Directory",
    action: "invite, suspend, assign_roles",
    admin: "Full",
    manager: "Scoped",
    support: "Request",
    auditor: "Read",
  },
  {
    module: "Billing",
    action: "approve_refund, export_invoice",
    admin: "Full",
    manager: "Approve",
    support: "None",
    auditor: "Read",
  },
  {
    module: "Audit",
    action: "review_log, export_log",
    admin: "Full",
    manager: "Review",
    support: "None",
    auditor: "Full",
  },
  {
    module: "Policy Engine",
    action: "publish_policy, rollback_policy",
    admin: "Full",
    manager: "None",
    support: "None",
    auditor: "Review",
  },
] as const;

const publishRules = [
  "Permission mới phải có owner, module và mức nhạy cảm.",
  "Action destructive phải có lý do và audit event bắt buộc.",
  "Không publish nếu chưa có role nào tiêu thụ permission vừa tạo.",
] as const;

function RouteComponent() {
  return (
    <section className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-primary/10 bg-[linear-gradient(145deg,rgba(120,83,32,0.08),rgba(255,255,255,0.82))]">
          <CardHeader className="space-y-4">
            <Badge className="w-fit" variant="secondary">
              Permission matrix
            </Badge>
            <div className="space-y-3">
              <CardTitle className="text-5xl leading-tight text-balance">
                Ma trận quyền cần đọc được ngay: module nào, action nào, role nào sở hữu.
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-8">
                Đây là bề mặt quan trọng nhất của RBAC. UI phải giúp team nhìn ra ngay quyền nào
                đang nhạy cảm, role nào đang ôm quá nhiều hành động và điểm nào cần approval.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button size="lg">Thêm permission</Button>
            <Button size="lg" variant="outline">
              Publish policy version
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
          {permissionSets.map((item) => (
            <Card key={item.label}>
              <CardContent className="space-y-2 p-6">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-3xl font-semibold">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Role to permission matrix</CardTitle>
            <CardDescription>
              Bảng này là nền cho bulk edit, compare environments và approval diff view.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[760px] space-y-3">
                <div className="grid grid-cols-[1.1fr_1fr_0.7fr_0.7fr_0.7fr_0.7fr] gap-3 px-4 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  <div>Module</div>
                  <div>Actions</div>
                  <div>Admin</div>
                  <div>Manager</div>
                  <div>Support</div>
                  <div>Auditor</div>
                </div>
                {matrixRows.map((row) => (
                  <div
                    key={row.module}
                    className="grid grid-cols-[1.1fr_1fr_0.7fr_0.7fr_0.7fr_0.7fr] gap-3 rounded-[1.5rem] border border-border/70 bg-background/65 px-4 py-4"
                  >
                    <div>
                      <p className="font-semibold">{row.module}</p>
                    </div>
                    <div className="text-sm leading-6 text-muted-foreground">
                      {row.action}
                    </div>
                    <div>
                      <Badge variant={row.admin === "Full" ? "destructive" : "outline"}>
                        {row.admin}
                      </Badge>
                    </div>
                    <div>
                      <Badge variant={row.manager === "None" ? "outline" : "warning"}>
                        {row.manager}
                      </Badge>
                    </div>
                    <div>
                      <Badge variant={row.support === "None" ? "outline" : "secondary"}>
                        {row.support}
                      </Badge>
                    </div>
                    <div>
                      <Badge variant={row.auditor === "Full" ? "success" : "outline"}>
                        {row.auditor}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Publish rules</CardTitle>
              <CardDescription>
                Những guardrail nên được hiển thị ngay bên cạnh matrix để giảm sai sót.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {publishRules.map((rule) => (
                <div
                  key={rule}
                  className="rounded-[1.5rem] border border-border/70 bg-background/65 p-4"
                >
                  <p className="text-sm leading-7">{rule}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permission grouping</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="destructive">Sensitive</Badge>
              <Badge variant="warning">Approval required</Badge>
              <Badge variant="secondary">Operational</Badge>
              <Badge variant="outline">Readonly</Badge>
              <Badge variant="success">Audit-safe</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

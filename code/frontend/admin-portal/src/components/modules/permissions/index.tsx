import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";

const permissions = [
  {
    id: "users.read",
    module: "Users",
    description: "Xem danh sach nguoi dung",
    status: "Read only",
    statusVariant: "outline" as const,
  },
  {
    id: "users.manage",
    module: "Users",
    description: "Them, sua va khoa tai khoan",
    status: "Sensitive",
    statusVariant: "destructive" as const,
  },
  {
    id: "roles.read",
    module: "Roles",
    description: "Xem danh sach vai tro",
    status: "Read only",
    statusVariant: "outline" as const,
  },
  {
    id: "permissions.manage",
    module: "Permissions",
    description: "Them va cap nhat quyen",
    status: "Sensitive",
    statusVariant: "warning" as const,
  },
] as const;

const Permissions = () => {
  return (
    <section className="space-y-6">
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl">Quan ly quyen</CardTitle>
            <CardDescription>
              Danh sach quyen trong he thong va thao tac quan tri co ban.
            </CardDescription>
          </div>

          <Button className="sm:self-auto">
            <Plus className="size-4" />
            Them quyen
          </Button>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-0">
              <thead>
                <tr className="text-left">
                  <th className="border-b border-border/70 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Ma quyen
                  </th>
                  <th className="border-b border-border/70 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Module
                  </th>
                  <th className="border-b border-border/70 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Mo ta
                  </th>
                  <th className="border-b border-border/70 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Trang thai
                  </th>
                  <th className="border-b border-border/70 pb-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Thao tac
                  </th>
                </tr>
              </thead>

              <tbody>
                {permissions.map((permission) => (
                  <tr key={permission.id}>
                    <td className="border-b border-border/50 py-4 pr-4 text-sm font-medium">
                      {permission.id}
                    </td>
                    <td className="border-b border-border/50 py-4 pr-4 text-sm text-muted-foreground">
                      {permission.module}
                    </td>
                    <td className="border-b border-border/50 py-4 pr-4 text-sm text-muted-foreground">
                      {permission.description}
                    </td>
                    <td className="border-b border-border/50 py-4 pr-4">
                      <Badge variant={permission.statusVariant}>
                        {permission.status}
                      </Badge>
                    </td>
                    <td className="border-b border-border/50 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">
                          <Pencil className="size-4" />
                          Chinh sua
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="size-4" />
                          Xoa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default Permissions;

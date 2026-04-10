import { useCallback, useState } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { AddPermissionSheet } from "./add-permission-sheet";
import { EditPermissionSheet } from "./edit-permission-sheet";

// PermissionRow mirrors what we store in local state.
// id    → UUID returned by the backend (used for PATCH/DELETE)
// code  → machine-readable code, e.g. "users.read"
// route → frontend route / module name, e.g. "/users"
type PermissionRow = {
  id: string;
  code: string;
  route: string;
  description: string;
  status: string;
  statusVariant: "outline" | "destructive" | "warning" | "default" | "secondary";
};

/* ─── Static seed for development ─── */
const initialPermissions: PermissionRow[] = [
  {
    id: "seed-1",
    code: "users.read",
    route: "/users",
    description: "Xem danh sách người dùng",
    status: "Chỉ đọc",
    statusVariant: "outline",
  },
  {
    id: "seed-2",
    code: "users.manage",
    route: "/users",
    description: "Thêm, sửa và khóa tài khoản",
    status: "Nhạy cảm",
    statusVariant: "destructive",
  },
  {
    id: "seed-3",
    code: "roles.read",
    route: "/roles",
    description: "Xem danh sách vai trò",
    status: "Chỉ đọc",
    statusVariant: "outline",
  },
  {
    id: "seed-4",
    code: "permissions.manage",
    route: "/permissions",
    description: "Thêm và cập nhật quyền",
    status: "Nhạy cảm",
    statusVariant: "warning",
  },
];

const Permissions = () => {
  const [permissions, setPermissions] =
    useState<PermissionRow[]>(initialPermissions);

  /* AddPermissionSheet callback — permission comes back from the API */
  const handleAddPermission = useCallback(
    (newPermission: {
      id: string;
      module: string;
      description: string;
      status: string;
      statusVariant: "outline" | "destructive" | "warning" | "default" | "secondary";
    }) => {
      setPermissions((prev) => [
        {
          id: newPermission.id,
          code: newPermission.id,        // AddPermissionSheet sets id = code
          route: newPermission.module,   // AddPermissionSheet sets module = route
          description: newPermission.description,
          status: newPermission.status,
          statusVariant: newPermission.statusVariant,
        },
        ...prev,
      ]);
    },
    [],
  );

  /* EditPermissionSheet callback */
  const handleUpdatePermission = useCallback(
    (updated: { id: string; code: string; route: string; description: string }) => {
      setPermissions((prev) =>
        prev.map((p) =>
          p.id === updated.id
            ? { ...p, code: updated.code, route: updated.route, description: updated.description }
            : p,
        ),
      );
    },
    [],
  );

  return (
    <section className="space-y-6">
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl">Quản lý quyền</CardTitle>
            <CardDescription>
              Danh sách quyền trong hệ thống và thao tác quản trị cơ bản.
            </CardDescription>
          </div>

          <AddPermissionSheet onAdd={handleAddPermission} />
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-0">
              <thead>
                <tr className="text-left">
                  <th className="border-b border-border/70 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Mã quyền
                  </th>
                  <th className="border-b border-border/70 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Route
                  </th>
                  <th className="border-b border-border/70 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Mô tả
                  </th>
                  <th className="border-b border-border/70 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Trạng thái
                  </th>
                  <th className="border-b border-border/70 pb-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {permissions.map((permission) => (
                  <tr key={permission.id}>
                    <td className="border-b border-border/50 py-4 pr-4 text-sm font-medium">
                      {permission.code}
                    </td>
                    <td className="border-b border-border/50 py-4 pr-4 text-sm text-muted-foreground">
                      {permission.route}
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
                        <EditPermissionSheet
                          permission={permission}
                          onUpdated={handleUpdatePermission}
                        />
                        <Button size="sm" variant="ghost">
                          <Trash2 className="size-4" />
                          Xóa
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

import { Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { DataTable } from "../../ui/data-table";
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
  statusVariant:
    | "outline"
    | "destructive"
    | "warning"
    | "default"
    | "secondary";
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
      statusVariant:
        | "outline"
        | "destructive"
        | "warning"
        | "default"
        | "secondary";
    }) => {
      setPermissions((prev) => [
        {
          id: newPermission.id,
          code: newPermission.id, // AddPermissionSheet sets id = code
          route: newPermission.module, // AddPermissionSheet sets module = route
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
    (updated: {
      id: string;
      code: string;
      route: string;
      description: string;
    }) => {
      setPermissions((prev) =>
        prev.map((p) =>
          p.id === updated.id
            ? {
                ...p,
                code: updated.code,
                route: updated.route,
                description: updated.description,
              }
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
            <DataTable
              className="min-w-[720px]"
              columns={[
                {
                  header: "Mã quyền",
                  accessorKey: "code",
                  cellClassName: "font-medium",
                },
                {
                  header: "Route",
                  accessorKey: "route",
                  cellClassName: "text-muted-foreground",
                },
                {
                  header: "Mô tả",
                  accessorKey: "description",
                  cellClassName: "text-muted-foreground",
                },
                {
                  header: "Trạng thái",
                  cell: (permission) => (
                    <Badge variant={permission.statusVariant}>
                      {permission.status}
                    </Badge>
                  ),
                },
                {
                  header: "Thao tác",
                  className: "text-right",
                  cell: (permission) => (
                    <div className="flex justify-end gap-2">
                      <EditPermissionSheet
                        permission={permission}
                        onUpdated={handleUpdatePermission}
                      />
                      <Button size="icon-sm" variant="ghost" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ),
                },
              ]}
              data={permissions}
              emptyMessage="Chưa có quyền nào. Hãy thêm quyền đầu tiên!"
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default Permissions;

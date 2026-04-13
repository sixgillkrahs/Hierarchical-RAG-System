import { useRoles } from "@/presentation/hooks/roles/useRoles";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { DataTable } from "../../ui/data-table";
import { AddRoleSheet } from "./add-role-sheet";
import { DeleteRoleDialog } from "./delete-role-dialog";
import { EditRoleSheet } from "./edit-role-sheet";
import { RoleDetailSheet } from "./role-detail-sheet";

const PAGE_SIZE = 10;

const Roles = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useRoles({ page, limit: PAGE_SIZE });

  const roles = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <section className="space-y-6">
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl">Quản lý vai trò</CardTitle>
            <CardDescription>
              Danh sách vai trò trong hệ thống và thao tác quản trị cơ bản.
            </CardDescription>
          </div>

          <AddRoleSheet />
        </CardHeader>

        <CardContent>
          {isError && (
            <p className="py-8 text-center text-sm text-destructive">
              Không thể tải danh sách vai trò. Vui lòng thử lại.
            </p>
          )}

          {!isError && (
            <div className="overflow-x-auto">
              <DataTable
                isLoading={isLoading}
                className="min-w-[500px]"
                columns={[
                  {
                    header: "Tên vai trò",
                    accessorKey: "name",
                    cellClassName: "font-medium",
                  },
                  {
                    header: "Mô tả",
                    accessorKey: "description",
                    cellClassName: "text-muted-foreground",
                  },
                  {
                    header: "Thao tác",
                    className: "text-right",
                    cell: (role) => (
                      <div className="flex justify-end gap-2">
                        <RoleDetailSheet role={role} />
                        <EditRoleSheet role={role} />
                        <DeleteRoleDialog
                          roleId={role.id}
                          roleName={role.name}
                        />
                      </div>
                    ),
                  },
                ]}
                data={roles}
                emptyMessage="Chưa có vai trò nào. Hãy thêm vai trò đầu tiên!"
                pagination={{
                  page,
                  totalPages,
                  onPageChange: setPage,
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default Roles;

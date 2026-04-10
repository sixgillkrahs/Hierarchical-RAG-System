import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { AddRoleSheet } from "./add-role-sheet";
import { EditRoleSheet } from "./edit-role-sheet";
import { RoleDetailSheet } from "./role-detail-sheet";
import { DeleteRoleDialog } from "./delete-role-dialog";
import { useRoles } from "@/presentation/hooks/roles/useRoles";

const PAGE_SIZE = 10;

const Roles = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useRoles({ page, limit: PAGE_SIZE });

  const roles = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

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
          {isLoading && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Đang tải dữ liệu...
            </p>
          )}

          {isError && (
            <p className="py-8 text-center text-sm text-destructive">
              Không thể tải danh sách vai trò. Vui lòng thử lại.
            </p>
          )}

          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] border-separate border-spacing-0">
                <thead>
                  <tr className="text-left">
                    <th className="border-b border-border/70 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Tên vai trò
                    </th>
                    <th className="border-b border-border/70 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Mô tả
                    </th>
                    <th className="border-b border-border/70 pb-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {roles.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        Chưa có vai trò nào. Hãy thêm vai trò đầu tiên!
                      </td>
                    </tr>
                  )}
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td className="border-b border-border/50 py-4 pr-4 text-sm font-medium">
                        {role.name}
                      </td>
                      <td className="border-b border-border/50 py-4 pr-4 text-sm text-muted-foreground">
                        {role.description}
                      </td>
                      <td className="border-b border-border/50 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <RoleDetailSheet role={role} />
                          <EditRoleSheet role={role} />
                          <DeleteRoleDialog
                            roleId={role.id}
                            roleName={role.name}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>

        {!isLoading && !isError && totalPages > 1 && (
          <CardFooter className="flex items-center justify-between gap-4 border-t border-border/50 pt-4">
            <p className="text-xs text-muted-foreground">
              Đang ở trang{" "}
              <span className="font-medium text-foreground">{page}</span> /{" "}
              {totalPages} (Tổng cộng {total} vai trò)
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                <ChevronLeft className="mr-1 size-4" />
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page >= totalPages}
              >
                Tiếp
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </section>
  );
};

export default Roles;

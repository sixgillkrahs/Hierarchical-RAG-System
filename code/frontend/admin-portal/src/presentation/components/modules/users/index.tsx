import { useUsers } from "@/presentation/hooks/users/useUsers";
import { Badge } from "../../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { DataTable } from "../../ui/data-table";
import { AddUserSheet } from "./add-user-sheet";
import { DeleteUserDialog } from "./delete-user-dialog";
import { EditUserSheet } from "./edit-user-sheet";
import { UserDetailSheet } from "./user-detail-sheet";
import { useState } from "react";

const Users = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data: apiUsers, isLoading, isError } = useUsers({ page, limit });

  const users = apiUsers?.data ?? [];
  const totalPages = apiUsers?.totalPages ?? 1;

  return (
    <section className="space-y-6">
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl">Quản lý người dùng</CardTitle>
            <CardDescription>
              Danh sách người dùng trong hệ thống và phân quyền vai trò.
            </CardDescription>
          </div>

          <AddUserSheet />
        </CardHeader>

        <CardContent>
          {isError && (
            <p className="py-8 text-center text-sm text-destructive">
              Không thể tải danh sách người dùng. Vui lòng thử lại.
            </p>
          )}

          {!isError && (
            <div className="overflow-x-auto">
              <DataTable
                isLoading={isLoading}
                className="min-w-[800px]"
                columns={[
                  {
                    header: "Người dùng",
                    cell: (user) => (
                      <div>
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    ),
                  },
                  {
                    header: "Vai trò",
                    cell: (user) => (
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge
                            key={role}
                            variant="outline"
                            className="font-mono text-xs font-normal"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    ),
                  },
                  {
                    header: "Trạng thái",
                    cell: (user) => (
                      <Badge
                        variant={
                          user.isActive ? ("success" as any) : "destructive"
                        }
                      >
                        {user.isActive ? "Hoạt động" : "Đã khoá"}
                      </Badge>
                    ),
                  },
                  {
                    header: "Mức độ rủi ro",
                    cell: (user) => {
                      const isAdmin = user.roles.some((r) =>
                        r.toLowerCase().includes("admin"),
                      );
                      return (
                        <Badge variant={isAdmin ? "destructive" : "secondary"}>
                          {isAdmin ? "Cao" : "Thấp"}
                        </Badge>
                      );
                    },
                  },
                  {
                    header: "Review gần nhất",
                    cell: (user) => (
                      <span className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    ),
                  },
                  {
                    header: "Thao tác",
                    className: "text-right",
                    cell: (user) => (
                      <div className="flex justify-end gap-2">
                        <UserDetailSheet user={user} />
                        <EditUserSheet user={user} />
                        <DeleteUserDialog
                          userId={user.id}
                          userName={user.displayName}
                        />
                      </div>
                    ),
                  },
                ]}
                data={users}
                emptyMessage="Chưa có người dùng nào. Hãy mời người dùng đầu tiên!"
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

export default Users;

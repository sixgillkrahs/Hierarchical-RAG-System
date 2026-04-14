import type { PermissionEntity } from "@/domain/entities/permission.entity";
import { usePaginatedPermissions } from "@/presentation/hooks/usePermissions";
import { useState } from "react";
import { Badge } from "../../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { DataTable } from "../../ui/data-table";
import { AddPermissionSheet } from "./add-permission-sheet";
import { DeletePermissionDialog } from "./delete-permission-dialog";
import { EditPermissionSheet } from "./edit-permission-sheet";

const PAGE_SIZE = 10;

const getPermissionStatus = (code: string) => {
  if (code.endsWith(".manage")) {
    return {
      label: "Sensitive",
      variant: "destructive" as const,
    };
  }

  if (code.endsWith(".write") || code.endsWith(".create") || code.endsWith(".update")) {
    return {
      label: "Mutable",
      variant: "warning" as const,
    };
  }

  return {
    label: "Read only",
    variant: "outline" as const,
  };
};

const Permissions = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = usePaginatedPermissions({
    page,
    limit: PAGE_SIZE,
  });
  const permissions = [...(data?.data ?? [])].sort((left, right) =>
    left.code.localeCompare(right.code),
  );
  const totalPages = data?.totalPages ?? 1;

  return (
    <section className="space-y-6">
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl">Permission management</CardTitle>
            <CardDescription>
              Live RBAC permission catalog loaded from the backend API.
            </CardDescription>
          </div>

          <AddPermissionSheet />
        </CardHeader>

        <CardContent>
          {isError && (
            <p className="py-8 text-center text-sm text-destructive">
              Could not load permissions. Try again.
            </p>
          )}

          {!isError && (
            <div className="overflow-x-auto">
              <DataTable<PermissionEntity>
                isLoading={isLoading}
                className="min-w-[720px]"
                columns={[
                  {
                    header: "Permission code",
                    accessorKey: "code",
                    cellClassName: "font-medium",
                  },
                  {
                    header: "Route",
                    accessorKey: "route",
                    cellClassName: "text-muted-foreground",
                  },
                  {
                    header: "Description",
                    accessorKey: "description",
                    cellClassName: "text-muted-foreground",
                  },
                  {
                    header: "Status",
                    cell: (permission) => {
                      const status = getPermissionStatus(permission.code);

                      return (
                        <Badge variant={status.variant}>{status.label}</Badge>
                      );
                    },
                  },
                  {
                    header: "Actions",
                    className: "text-right",
                    cell: (permission) => (
                      <div className="flex justify-end gap-2">
                        <EditPermissionSheet permission={permission} />
                        <DeletePermissionDialog
                          permissionId={permission.id}
                          permissionCode={permission.code}
                        />
                      </div>
                    ),
                  },
                ]}
                data={permissions}
                emptyMessage="No permissions found."
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

export default Permissions;

import { useQuery } from "@tanstack/react-query";
import { PermissionsApi } from "@/infrastructure/api/permissions.api";
import type { PermissionEntity } from "@/domain/entities/permission.entity";

export const PERMISSIONS_QUERY_KEY = ["permissions"] as const;

export const usePermissions = () => {
  return useQuery<PermissionEntity[], Error>({
    queryKey: PERMISSIONS_QUERY_KEY,
    queryFn: () => PermissionsApi.getAll(),
  });
};

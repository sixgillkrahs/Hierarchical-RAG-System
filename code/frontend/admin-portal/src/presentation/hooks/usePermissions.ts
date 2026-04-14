import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PermissionsApi } from "@/infrastructure/api/permissions.api";
import type {
  PermissionEntity,
  GetPermissionsParams,
  PaginatedPermissions,
} from "@/domain/entities/permission.entity";

export const PERMISSIONS_QUERY_KEY = ["permissions"] as const;

export const usePermissions = () => {
  return useQuery<PermissionEntity[], Error>({
    queryKey: [...PERMISSIONS_QUERY_KEY, "catalog"],
    queryFn: async () => {
      const response = await PermissionsApi.getAll({ page: 1, limit: 1000 });

      return response.data;
    },
  });
};

export const usePaginatedPermissions = (
  params: GetPermissionsParams = { page: 1, limit: 10 },
) => {
  return useQuery<PaginatedPermissions, Error>({
    queryKey: [...PERMISSIONS_QUERY_KEY, "list", params],
    queryFn: () => PermissionsApi.getAll(params),
    placeholderData: keepPreviousData,
  });
};

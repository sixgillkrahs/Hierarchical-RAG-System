import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PermissionsApi,
} from "@/infrastructure/api/permissions.api";
import type { DeletePermissionResponse } from "@/domain/entities/permission.entity";
import { PERMISSIONS_QUERY_KEY } from "./usePermissions";

export const useDeletePermission = () => {
  const queryClient = useQueryClient();

  return useMutation<DeletePermissionResponse, Error, string>({
    mutationFn: (id) => PermissionsApi.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PERMISSIONS_QUERY_KEY }),
  });
};

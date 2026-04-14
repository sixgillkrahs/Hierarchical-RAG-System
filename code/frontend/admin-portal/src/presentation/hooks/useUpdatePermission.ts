import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionsApi } from "@/infrastructure/api/permissions.api";
import type {
  UpdatePermissionPayload,
  UpdatePermissionResponse,
} from "@/domain/entities/permission.entity";
import { PERMISSIONS_QUERY_KEY } from "./usePermissions";

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdatePermissionResponse, Error, UpdatePermissionPayload>({
    mutationFn: (payload) => PermissionsApi.update(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PERMISSIONS_QUERY_KEY }),
  });
};

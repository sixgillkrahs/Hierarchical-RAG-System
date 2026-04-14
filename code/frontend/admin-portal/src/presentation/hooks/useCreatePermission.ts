import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionsApi } from "@/infrastructure/api/permissions.api";
import type {
  CreatePermissionPayload,
  CreatePermissionResponse,
} from "@/domain/entities/permission.entity";
import { PERMISSIONS_QUERY_KEY } from "./usePermissions";

export const useCreatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation<CreatePermissionResponse, Error, CreatePermissionPayload>({
    mutationFn: (payload) => PermissionsApi.create(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PERMISSIONS_QUERY_KEY }),
  });
};

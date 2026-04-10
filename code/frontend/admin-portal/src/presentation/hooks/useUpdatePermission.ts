import { useMutation } from "@tanstack/react-query";
import { PermissionsApi } from "@/infrastructure/api/permissions.api";
import type {
  UpdatePermissionPayload,
  UpdatePermissionResponse,
} from "@/domain/entities/permission.entity";

export const useUpdatePermission = () => {
  return useMutation<UpdatePermissionResponse, Error, UpdatePermissionPayload>({
    mutationFn: (payload) => PermissionsApi.update(payload),
  });
};

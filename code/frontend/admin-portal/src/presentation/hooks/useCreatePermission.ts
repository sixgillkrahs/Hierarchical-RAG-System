import { useMutation } from "@tanstack/react-query";
import { PermissionsApi } from "@/infrastructure/api/permissions.api";
import type {
  CreatePermissionPayload,
  CreatePermissionResponse,
} from "@/domain/entities/permission.entity";

export const useCreatePermission = () => {
  return useMutation<CreatePermissionResponse, Error, CreatePermissionPayload>({
    mutationFn: (payload) => PermissionsApi.create(payload),
  });
};

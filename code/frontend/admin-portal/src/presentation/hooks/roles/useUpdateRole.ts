import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RolesApi } from "@/infrastructure/api/roles.api";
import type {
  UpdateRolePayload,
  UpdateRoleResponse,
} from "@/domain/entities/role.entity";
import { ROLEKEY } from "./keys";

export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation<UpdateRoleResponse, Error, UpdateRolePayload>({
    mutationFn: (payload) => RolesApi.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLEKEY.all }),
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RolesApi } from "@/infrastructure/api/roles.api";
import type {
  CreateRolePayload,
  CreateRoleResponse,
} from "@/domain/entities/role.entity";
import { ROLEKEY } from "./keys";

export const useCreateRole = () => {
  const qc = useQueryClient();
  return useMutation<CreateRoleResponse, Error, CreateRolePayload>({
    mutationFn: (payload) => RolesApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLEKEY.all }),
  });
};

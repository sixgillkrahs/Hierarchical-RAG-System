import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RolesApi,
  type DeleteRoleResponse,
} from "@/infrastructure/api/roles.api";
import { ROLEKEY } from "./keys";

export const useDeleteRole = () => {
  const qc = useQueryClient();
  return useMutation<DeleteRoleResponse, Error, string>({
    mutationFn: (id) => RolesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLEKEY.all }),
    meta: {
      ERROR_SOURCE: "Xóa vai trò thất bại",
      SUCCESS_MESSAGE: "Xóa vai trò thành công",
    },
  });
};

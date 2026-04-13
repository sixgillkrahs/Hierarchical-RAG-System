import type { DeleteUserResponse } from "@/domain/entities/user.entity";
import { UsersApi } from "@/infrastructure/api/users.api";
import { queryClient } from "@/shared/query/queryClient";
import { useMutation } from "@tanstack/react-query";
import { USERKEY } from "./keys";

export const useDeleteUser = () => {
  return useMutation<DeleteUserResponse, Error, string>({
    mutationFn: (id) => UsersApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERKEY.all }),
    meta: {
      ERROR_SOURCE: "Xóa người dùng thất bại",
      SUCCESS_MESSAGE: "Xóa người dùng thành công",
    },
  });
};

import type {
  UpdateUserPayload,
  UpdateUserResponse,
} from "@/domain/entities/user.entity";
import { UsersApi } from "@/infrastructure/api/users.api";
import { queryClient } from "@/shared/query/queryClient";
import { useMutation } from "@tanstack/react-query";
import { USERKEY } from "./keys";

export const useUpdateUser = () => {
  return useMutation<UpdateUserResponse, Error, UpdateUserPayload>({
    mutationFn: (payload) => UsersApi.update(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERKEY.all }),
    meta: {
      ERROR_SOURCE: "Cập nhật người dùng thất bại",
      SUCCESS_MESSAGE: "Cập nhật người dùng thành công",
    },
  });
};

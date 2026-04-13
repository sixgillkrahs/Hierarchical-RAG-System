import type {
  CreateUserPayload,
  CreateUserResponse,
} from "@/domain/entities/user.entity";
import { UsersApi } from "@/infrastructure/api/users.api";
import { useMutation } from "@tanstack/react-query";
import { USERKEY } from "./keys";
import { queryClient } from "@/shared/query/queryClient";

export const useCreateUser = () => {
  return useMutation<CreateUserResponse, Error, CreateUserPayload>({
    mutationFn: (payload) => UsersApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERKEY.all }),
    meta: {
      ERROR_SOURCE: "Tạo người dùng thất bại",
      SUCCESS_MESSAGE: "Tạo người dùng thành công",
    },
  });
};

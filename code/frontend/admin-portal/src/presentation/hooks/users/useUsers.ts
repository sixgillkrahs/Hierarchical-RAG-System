import type { UserEntity } from "@/domain/entities/user.entity";
import { getUsers } from "@/domain/usecases/getUsers";
import { userRepository } from "@/infrastructure/repositories/userRepository";
import { useQuery } from "@tanstack/react-query";
import { USERKEY } from "./keys";

import type { GetPaginatedParams } from "@/shared/types";
import type { PaginatedResult } from "@/domain/entities/role.entity";

export const useUsers = (params: GetPaginatedParams = { page: 1, limit: 100 }) => {
  return useQuery<PaginatedResult<UserEntity>, Error>({
    queryKey: [...USERKEY.list(), params],
    queryFn: () => getUsers(userRepository, params),
  });
};

import type { UserEntity, UserRepositoryProps } from "../entities/user.entity";
import type { GetPaginatedParams } from "@/shared/types";
import type { PaginatedResult } from "../entities/role.entity";

export const getUsers = async (
  repository: UserRepositoryProps,
  params: GetPaginatedParams,
): Promise<PaginatedResult<UserEntity>> => {
  return repository.getUsers(params);
};


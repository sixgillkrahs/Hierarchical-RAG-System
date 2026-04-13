import type {
  UserEntity,
  UserRepositoryProps,
} from "@/domain/entities/user.entity";
import { UsersApi } from "@/infrastructure/api/users.api";
import type { GetPaginatedParams } from "@/shared/types";
import { type PaginatedResult } from "./../../domain/entities/role.entity";

export const userRepository: UserRepositoryProps = {
  async getUsers(
    params: GetPaginatedParams,
  ): Promise<PaginatedResult<UserEntity>> {
    return UsersApi.getAll(params);
  },
};

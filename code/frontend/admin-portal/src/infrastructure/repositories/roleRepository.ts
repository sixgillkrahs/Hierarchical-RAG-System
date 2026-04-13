import type { GetPaginatedParams } from "@/shared/types";
import type {
  PaginatedResult,
  RoleEntity,
} from "@/domain/entities/role.entity";
import { RolesApi } from "@/infrastructure/api/roles.api";

export const roleRepository = {
  async getRoles(
    params: GetPaginatedParams,
  ): Promise<PaginatedResult<RoleEntity>> {
    return RolesApi.getAll(params);
  },
};

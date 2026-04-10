import type {
  RoleEntity,
  GetRolesParams,
  PaginatedResult,
} from "@/domain/entities/role.entity";
import { RolesApi } from "@/infrastructure/api/roles.api";

export const roleRepository = {
  async getRoles(params: GetRolesParams): Promise<PaginatedResult<RoleEntity>> {
    return RolesApi.getAll(params);
  },
};

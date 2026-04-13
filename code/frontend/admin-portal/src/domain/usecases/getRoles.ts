import type { GetPaginatedParams } from "@/shared/types";
import type { PaginatedResult, RoleEntity } from "../entities/role.entity";

export const getRoles = async (
  repo: {
    getRoles: (
      params: GetPaginatedParams,
    ) => Promise<PaginatedResult<RoleEntity>>;
  },
  params: GetPaginatedParams,
) => {
  return repo.getRoles(params);
};

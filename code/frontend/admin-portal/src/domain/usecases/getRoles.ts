import type {
  RoleEntity,
  GetRolesParams,
  PaginatedResult,
} from "../entities/role.entity";

export const getRoles = async (
  repo: {
    getRoles: (params: GetRolesParams) => Promise<PaginatedResult<RoleEntity>>;
  },
  params: GetRolesParams,
) => {
  return repo.getRoles(params);
};

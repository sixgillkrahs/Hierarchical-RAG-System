import type {
  GetRolesParams,
  PaginatedResult,
  RoleEntity,
} from "@/domain/entities/role.entity";
import { getRoles } from "@/domain/usecases/getRoles";
import { roleRepository } from "@/infrastructure/repositories/roleRepository";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ROLEKEY } from "./keys";

export const useRoles = (params: GetRolesParams = { page: 1, limit: 10 }) => {
  return useQuery<PaginatedResult<RoleEntity>, Error>({
    queryKey: [...ROLEKEY.list(params)],
    queryFn: () => getRoles(roleRepository, params),
    placeholderData: keepPreviousData,
  });
};

/** Helpers for other hooks to invalidate / optimistically update the list */
export const useRolesQueryClient = () => {
  const qc = useQueryClient();

  return {
    invalidate: () => qc.invalidateQueries({ queryKey: ROLEKEY.all }),
  };
};

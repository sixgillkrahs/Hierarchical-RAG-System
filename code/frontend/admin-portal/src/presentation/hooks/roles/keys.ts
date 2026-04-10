import type { GetRolesParams } from "@/domain/entities/role.entity";

export const ROLEKEY = {
  all: ["roles"] as const,
  list: (params: GetRolesParams) => [...ROLEKEY.all, "list", params] as const,
  detail: (id: string) => [...ROLEKEY.all, "detail", id] as const,
  create: () => [...ROLEKEY.all, "create"] as const,
  update: (id: string) => [...ROLEKEY.all, "update", id] as const,
  delete: (id: string) => [...ROLEKEY.all, "delete", id] as const,
};

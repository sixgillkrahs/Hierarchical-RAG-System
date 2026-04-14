import type { StorageScope } from "@/domain/entities/role.entity";

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, "");

export const normalizeStoragePath = (path: string) =>
  trimSlashes(path.trim().replaceAll("\\", "/"));

const isSameOrDescendant = (path: string, prefix: string) => {
  if (!prefix) {
    return true;
  }

  return path === prefix || path.startsWith(`${prefix}/`);
};

const isSameOrAncestor = (path: string, prefix: string) => {
  if (!path) {
    return true;
  }

  return prefix === path || prefix.startsWith(`${path}/`);
};

const matchesScope = (
  rawPath: string,
  scope: StorageScope,
  capability: StorageScope["capability"],
) => {
  const path = normalizeStoragePath(rawPath);
  const prefix = normalizeStoragePath(scope.pathPrefix);

  if (scope.capability !== capability && scope.capability !== "manage") {
    return false;
  }

  if (path === prefix) {
    return true;
  }

  return scope.inheritChildren && isSameOrDescendant(path, prefix);
};

export const canReadStoragePath = (path: string, scopes: StorageScope[]) =>
  scopes.some((scope) => matchesScope(path, scope, "read"));

export const canManageStoragePath = (path: string, scopes: StorageScope[]) =>
  scopes.some((scope) => matchesScope(path, scope, "manage"));

export const canTraverseStoragePath = (rawPath: string, scopes: StorageScope[]) => {
  const path = normalizeStoragePath(rawPath);

  return scopes.some((scope) => {
    const prefix = normalizeStoragePath(scope.pathPrefix);

    return (
      matchesScope(path, scope, "read") ||
      matchesScope(path, scope, "manage") ||
      isSameOrAncestor(path, prefix)
    );
  });
};

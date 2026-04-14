import type {
  StorageScope,
  StorageScopeCapability,
} from "@/domain/entities/role.entity";
import { normalizeStoragePath } from "@/shared/auth/storage-scope";

export const STORAGE_SCOPE_CAPABILITY_COPY: Record<
  StorageScopeCapability,
  {
    badgeVariant: "secondary" | "warning";
    description: string;
    label: string;
  }
> = {
  read: {
    label: "View only",
    description: "Browse folders and see document metadata.",
    badgeVariant: "secondary",
  },
  manage: {
    label: "Manage files",
    description: "Upload, organize, and view storage content.",
    badgeVariant: "warning",
  },
};

export const STORAGE_SCOPE_INHERITANCE_COPY = {
  exact: {
    label: "Exact folder only",
    description: "Stops at the selected folder.",
  },
  children: {
    label: "Includes subfolders",
    description: "Cascades through everything nested below.",
  },
} as const;

export const formatStorageScopePath = (pathPrefix: string) => {
  const normalizedPath = normalizeStoragePath(pathPrefix);

  return normalizedPath ? `/${normalizedPath}` : "/";
};

export const getStorageScopeTargetLabel = (pathPrefix: string) => {
  const normalizedPath = normalizeStoragePath(pathPrefix);

  return normalizedPath
    ? `Folder ${formatStorageScopePath(pathPrefix)}`
    : "Storage root";
};

export const buildStorageScopePreview = (scope: StorageScope) => {
  const pathLabel = scope.pathPrefix
    ? formatStorageScopePath(scope.pathPrefix)
    : "all storage";

  if (scope.capability === "manage") {
    return scope.inheritChildren
      ? `This role can manage ${pathLabel} and everything below it.`
      : `This role can manage only the exact folder ${pathLabel}.`;
  }

  return scope.inheritChildren
    ? `This role can view ${pathLabel} and everything below it.`
    : `This role can view only the exact folder ${pathLabel}.`;
};

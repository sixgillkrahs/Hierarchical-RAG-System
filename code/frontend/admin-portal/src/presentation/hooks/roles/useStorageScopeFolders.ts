import { useQuery } from "@tanstack/react-query";
import { RolesApi } from "@/infrastructure/api/roles.api";

const STORAGE_SCOPE_FOLDER_KEY = ["roles", "storage-scope-folders"] as const;

export const useStorageScopeFolders = (currentPath = "", enabled = true) =>
  useQuery({
    enabled,
    queryKey: [...STORAGE_SCOPE_FOLDER_KEY, currentPath],
    queryFn: () => RolesApi.listStorageScopeFolders(currentPath || undefined),
    staleTime: 1000 * 30,
  });

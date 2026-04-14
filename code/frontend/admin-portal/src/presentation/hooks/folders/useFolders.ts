import { useQuery } from "@tanstack/react-query";
import { FoldersApi } from "@/infrastructure/api/folders.api";
import { FOLDERKEY } from "./keys";

export const useFolders = (currentPath = "", enabled = true) =>
  useQuery({
    enabled,
    queryKey: FOLDERKEY.list(currentPath),
    queryFn: () => FoldersApi.list(currentPath || undefined),
  });

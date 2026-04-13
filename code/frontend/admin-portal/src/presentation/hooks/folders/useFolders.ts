import { useQuery } from "@tanstack/react-query";
import { FoldersApi } from "@/infrastructure/api/folders.api";
import { FOLDERKEY } from "./keys";

export const useFolders = (currentPath = "") =>
  useQuery({
    queryKey: FOLDERKEY.list(currentPath),
    queryFn: () => FoldersApi.list(currentPath || undefined),
  });

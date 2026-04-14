import { useQuery } from "@tanstack/react-query";
import { DocumentsApi } from "@/infrastructure/api/documents.api";
import { DOCUMENTKEY } from "./keys";

export const useDocuments = (currentPath = "", enabled = true) =>
  useQuery({
    enabled,
    queryKey: DOCUMENTKEY.list(currentPath),
    queryFn: () => DocumentsApi.list(currentPath || undefined),
  });

import { useMutation } from "@tanstack/react-query";
import type {
  FolderBulkDeletePayload,
  FolderBulkDeleteResponse,
} from "@/domain/entities/folder.entity";
import { FoldersApi } from "@/infrastructure/api/folders.api";
import { queryClient } from "@/shared/query/queryClient";
import { FOLDERKEY } from "./keys";

export const useDeleteFolders = () =>
  useMutation<FolderBulkDeleteResponse, Error, FolderBulkDeletePayload>({
    mutationFn: (payload) => FoldersApi.bulkDelete(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FOLDERKEY.all }),
    meta: {
      ERROR_SOURCE: "Xóa nhiều thư mục thất bại",
    },
  });

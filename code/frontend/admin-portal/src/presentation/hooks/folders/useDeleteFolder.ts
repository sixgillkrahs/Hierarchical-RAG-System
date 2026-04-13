import { useMutation } from "@tanstack/react-query";
import { FoldersApi } from "@/infrastructure/api/folders.api";
import { queryClient } from "@/shared/query/queryClient";
import { FOLDERKEY } from "./keys";
import type { FolderDeletePayload, FolderDeleteResponse } from "@/domain/entities/folder.entity";

export const useDeleteFolder = () =>
  useMutation<FolderDeleteResponse, Error, FolderDeletePayload>({
    mutationFn: (payload) => FoldersApi.delete(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FOLDERKEY.all }),
    meta: {
      ERROR_SOURCE: "Xóa thư mục thất bại",
      SUCCESS_MESSAGE: "Xóa thư mục thành công",
    },
  });

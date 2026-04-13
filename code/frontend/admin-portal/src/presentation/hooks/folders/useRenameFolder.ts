import { useMutation } from "@tanstack/react-query";
import { FoldersApi } from "@/infrastructure/api/folders.api";
import { queryClient } from "@/shared/query/queryClient";
import { FOLDERKEY } from "./keys";
import type { FolderRenamePayload, FolderRenameResponse } from "@/domain/entities/folder.entity";

export const useRenameFolder = () =>
  useMutation<FolderRenameResponse, Error, FolderRenamePayload>({
    mutationFn: (payload) => FoldersApi.rename(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FOLDERKEY.all }),
    meta: {
      ERROR_SOURCE: "Đổi tên thư mục thất bại",
      SUCCESS_MESSAGE: "Đổi tên thư mục thành công",
    },
  });

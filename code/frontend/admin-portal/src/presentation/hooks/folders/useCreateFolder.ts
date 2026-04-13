import { useMutation } from "@tanstack/react-query";
import { FoldersApi } from "@/infrastructure/api/folders.api";
import { queryClient } from "@/shared/query/queryClient";
import { FOLDERKEY } from "./keys";
import type { FolderCreatePayload, FolderCreateResponse } from "@/domain/entities/folder.entity";

export const useCreateFolder = () =>
  useMutation<FolderCreateResponse, Error, FolderCreatePayload>({
    mutationFn: (payload) => FoldersApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FOLDERKEY.all }),
    meta: {
      ERROR_SOURCE: "Tạo thư mục thất bại",
      SUCCESS_MESSAGE: "Tạo thư mục thành công",
    },
  });

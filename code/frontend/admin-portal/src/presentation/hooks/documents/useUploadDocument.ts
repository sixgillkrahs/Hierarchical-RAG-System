import { useMutation } from "@tanstack/react-query";
import type {
  UploadDocumentPayload,
  UploadDocumentResponse,
} from "@/domain/entities/document.entity";
import { DocumentsApi } from "@/infrastructure/api/documents.api";
import { queryClient } from "@/shared/query/queryClient";
import { FOLDERKEY } from "../folders/keys";
import { DOCUMENTKEY } from "./keys";

export const useUploadDocument = () =>
  useMutation<UploadDocumentResponse, Error, UploadDocumentPayload>({
    mutationFn: (payload) => DocumentsApi.upload(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: DOCUMENTKEY.all,
        }),
        queryClient.invalidateQueries({
          queryKey: FOLDERKEY.all,
        }),
      ]);
    },
    meta: {
      ERROR_SOURCE: "Document upload failed",
      SUCCESS_MESSAGE: "Document uploaded successfully",
    },
  });

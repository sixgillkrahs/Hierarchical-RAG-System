import type {
  DocumentItem,
  DocumentListResponse,
  UploadDocumentPayload,
  UploadDocumentResponse,
} from "@/domain/entities/document.entity";
import { AxiosMethod } from "@/infrastructure/lib/axios/method";
import request from "@/infrastructure/lib/axios/request";

type RawDocument = Record<string, unknown>;

const readString = (...values: unknown[]) => {
  const value = values.find((candidate) => typeof candidate === "string");
  return typeof value === "string" ? value : undefined;
};

const readNumber = (...values: unknown[]) => {
  const value = values.find((candidate) => typeof candidate === "number");
  return typeof value === "number" ? value : undefined;
};

const normalizeDocument = (document: RawDocument): DocumentItem => {
  const path =
    readString(
      document.path,
      document.file_path,
      document.object_path,
      document.object_name,
      document.key,
    ) ?? "";
  const folderPath =
    readString(document.folder_path, document.current_path, document.folder) ??
    path.split("/").slice(0, -1).join("/");
  const name =
    readString(
      document.name,
      document.file_name,
      document.original_name,
      document.original_filename,
    ) ??
    path.split("/").filter(Boolean).at(-1) ??
    "Untitled";

  return {
    id: readString(document.id, document.document_id),
    name,
    path,
    folderPath,
    size: readNumber(document.size, document.file_size, document.bytes) ?? null,
    mimeType:
      readString(document.mime_type, document.content_type, document.type) ??
      null,
    status:
      readString(document.status, document.ingestion_status)?.toLowerCase() as
        | DocumentItem["status"]
        | undefined,
    uploadedAt:
      readString(document.uploaded_at, document.created_at, document.createdAt) ??
      null,
    createdAt:
      readString(document.created_at, document.createdAt, document.uploaded_at) ??
      null,
    updatedAt: readString(document.updated_at, document.updatedAt) ?? null,
    bucket: readString(document.bucket) ?? null,
  };
};

const normalizeDocumentList = (payload: unknown): DocumentListResponse => {
  if (Array.isArray(payload)) {
    return payload
      .filter((item): item is RawDocument => typeof item === "object" && item !== null)
      .map(normalizeDocument);
  }

  if (typeof payload === "object" && payload !== null) {
    const list = "documents" in payload ? payload.documents : undefined;

    if (Array.isArray(list)) {
      return list
        .filter((item): item is RawDocument => typeof item === "object" && item !== null)
        .map(normalizeDocument);
    }
  }

  return [];
};

export const DocumentsApi = {
  list: async (currentPath?: string): Promise<DocumentListResponse> => {
    const response = await request({
      url: "/documents",
      method: AxiosMethod.GET,
      params: currentPath ? { current_path: currentPath } : undefined,
    });

    return normalizeDocumentList(response);
  },

  upload: async (
    payload: UploadDocumentPayload,
  ): Promise<UploadDocumentResponse> => {
    const formData = new FormData();
    formData.append("file", payload.file);

    if (payload.folderPath) {
      formData.append("folder_path", payload.folderPath);
    }

    const response = (await request({
      url: "/documents/upload",
      method: AxiosMethod.POST,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })) as unknown;

    if (typeof response === "object" && response !== null) {
      return normalizeDocument(response as RawDocument);
    }

    return normalizeDocument({});
  },
};

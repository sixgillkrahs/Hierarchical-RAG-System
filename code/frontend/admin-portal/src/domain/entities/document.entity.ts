export type DocumentStatus =
  | "ready"
  | "processing"
  | "failed"
  | "uploaded"
  | "unknown";

export type DocumentItem = {
  id?: string;
  name: string;
  path: string;
  folderPath: string;
  size?: number | null;
  mimeType?: string | null;
  status?: DocumentStatus | null;
  uploadedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  bucket?: string | null;
};

export type DocumentListResponse = DocumentItem[];

export type UploadDocumentPayload = {
  file: File;
  folderPath?: string;
};

export type UploadDocumentResponse = DocumentItem;

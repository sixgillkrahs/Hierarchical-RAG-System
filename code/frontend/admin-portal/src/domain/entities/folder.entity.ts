// Domain entities for folders (MinIO prefix)
export type FolderItem = {
  name: string;
  path: string;
  prefix: string;
};

export type FolderListResponse = {
  current_path: string;
  bucket: string;
  folders: FolderItem[];
};

export type FolderCreatePayload = {
  folder_path: string;
};

export type FolderCreateResponse = {
  folder_path: string;
  prefix: string;
  bucket: string;
  url: string;
};

export type FolderDeletePayload = {
  folder_path: string;
};

export type FolderDeleteResponse = {
  folder_path: string;
  prefix: string;
  bucket: string;
  deleted_objects: number;
};

export type FolderBulkDeletePayload = {
  folder_paths: string[];
};

export type FolderBulkDeleteItemResponse = {
  folder_path: string;
  success: boolean;
  prefix?: string;
  bucket?: string;
  deleted_objects?: number;
  status_code?: number;
  error?: string;
};

export type FolderBulkDeleteResponse = {
  total: number;
  succeeded: number;
  failed: number;
  results: FolderBulkDeleteItemResponse[];
};

export type FolderRenamePayload = {
  current_path: string;
  new_path: string;
};

export type FolderRenameResponse = {
  old_path: string;
  old_prefix: string;
  new_path: string;
  new_prefix: string;
  bucket: string;
  moved_objects: number;
};

// Query keys for folders
export const FOLDERKEY = {
  all: ["folders"] as const,
  list: (path: string) => ["folders", "list", path] as const,
};

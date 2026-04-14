export const DOCUMENTKEY = {
  all: ["documents"] as const,
  list: (path: string) => ["documents", "list", path] as const,
};

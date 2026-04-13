export const USERKEY = {
  all: ["users"] as const,
  list: () => [...USERKEY.all, "list"] as const,
};

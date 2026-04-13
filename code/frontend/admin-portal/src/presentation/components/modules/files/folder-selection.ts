import type { Dispatch, SetStateAction } from "react";

type PathSetter = Dispatch<SetStateAction<string>>;
type SelectionSetter = Dispatch<SetStateAction<Set<string>>>;

export const clearFolderSelection = (setSelected: SelectionSetter) => {
  setSelected(new Set());
};

export const navigateToFolder = (
  path: string,
  setCurrentPath: PathSetter,
  setSelected: SelectionSetter,
) => {
  setCurrentPath(path);
  clearFolderSelection(setSelected);
};

export const toggleFolderSelection = (
  path: string,
  setSelected: SelectionSetter,
) => {
  setSelected((prev) => {
    const next = new Set(prev);

    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }

    return next;
  });
};

export const toggleAllFolders = (
  folderPaths: string[],
  setSelected: SelectionSetter,
) => {
  setSelected((prev) => {
    if (prev.size === folderPaths.length) {
      return new Set();
    }

    return new Set(folderPaths);
  });
};

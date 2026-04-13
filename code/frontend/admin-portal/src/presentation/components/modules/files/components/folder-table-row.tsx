import { memo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { FolderOpen } from "lucide-react";
import type { FolderItem } from "@/domain/entities/folder.entity";
import { navigateToFolder, toggleFolderSelection } from "../folder-selection";
import { DeleteFolderDialog } from "./delete-folder-dialog";
import { RenameFolderSheet } from "./rename-folder-sheet";
import { TableCell, TableRow } from "../../../ui/table";

type FolderTableRowProps = {
  folder: FolderItem;
  checked: boolean;
  setCurrentPath: Dispatch<SetStateAction<string>>;
  setSelected: Dispatch<SetStateAction<Set<string>>>;
};

export const FolderTableRow = memo(function FolderTableRow({
  folder,
  checked,
  setCurrentPath,
  setSelected,
}: FolderTableRowProps) {
  return (
    <TableRow>
      <TableCell className="w-10">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => toggleFolderSelection(folder.path, setSelected)}
          onClick={(event) => event.stopPropagation()}
          className="size-4 cursor-pointer accent-primary"
          aria-label={`Chọn ${folder.name}`}
        />
      </TableCell>
      <TableCell>
        <button
          onClick={() => navigateToFolder(folder.path, setCurrentPath, setSelected)}
          className="flex items-center gap-2 text-left transition-colors hover:text-primary"
        >
          <FolderOpen className="size-4 shrink-0 text-yellow-500" />
          <span className="font-medium">{folder.name}</span>
        </button>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <RenameFolderSheet folder={folder} />
          <DeleteFolderDialog folder={folder} />
        </div>
      </TableCell>
    </TableRow>
  );
});

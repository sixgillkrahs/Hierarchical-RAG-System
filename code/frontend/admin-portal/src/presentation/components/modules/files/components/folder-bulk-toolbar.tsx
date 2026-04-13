import { memo } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { FolderItem } from "@/domain/entities/folder.entity";
import { clearFolderSelection } from "../folder-selection";
import { BulkDeleteDialog } from "./bulk-delete-dialog";
import { Button } from "../../../ui/button";

type FolderBulkToolbarProps = {
  selected: FolderItem[];
  setSelected: Dispatch<SetStateAction<Set<string>>>;
};

export const FolderBulkToolbar = memo(function FolderBulkToolbar({
  selected,
  setSelected,
}: FolderBulkToolbarProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2.5">
      <span className="flex-1 text-sm text-muted-foreground">
        Đã chọn{" "}
        <span className="font-semibold text-foreground">{selected.length}</span>{" "}
        thư mục
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => clearFolderSelection(setSelected)}
      >
        Bỏ chọn
      </Button>
      <BulkDeleteDialog
        selected={selected}
        onDone={(remainingPaths) => setSelected(new Set(remainingPaths))}
      />
    </div>
  );
});

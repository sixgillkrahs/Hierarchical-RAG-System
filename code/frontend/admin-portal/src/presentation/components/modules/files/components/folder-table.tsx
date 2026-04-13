import { memo } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { FolderItem } from "@/domain/entities/folder.entity";
import { toggleAllFolders } from "../folder-selection";
import { FolderTableRow } from "./folder-table-row";
import { Skeleton } from "../../../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";

type FolderTableProps = {
  currentPath: string;
  folders: FolderItem[];
  isLoading: boolean;
  selected: Set<string>;
  setCurrentPath: Dispatch<SetStateAction<string>>;
  setSelected: Dispatch<SetStateAction<Set<string>>>;
};

export const FolderTable = memo(function FolderTable({
  currentPath,
  folders,
  isLoading,
  selected,
  setCurrentPath,
  setSelected,
}: FolderTableProps) {
  const allChecked = folders.length > 0 && selected.size === folders.length;
  const someChecked = selected.size > 0 && selected.size < folders.length;
  const folderPaths = folders.map((folder) => folder.path);

  return (
    <Table className="min-w-[420px]">
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <input
              type="checkbox"
              checked={allChecked}
              ref={(element) => {
                if (element) {
                  element.indeterminate = someChecked;
                }
              }}
              onChange={() => toggleAllFolders(folderPaths, setSelected)}
              className="size-4 cursor-pointer accent-primary"
              aria-label="Chọn tất cả"
            />
          </TableHead>
          <TableHead>Tên thư mục</TableHead>
          <TableHead className="text-right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={`folder-skeleton-${index}`}>
              <TableCell className="w-10">
                <Skeleton className="h-4 w-4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-full" />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : folders.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={3}
              className="h-24 text-center text-muted-foreground"
            >
              {currentPath
                ? "Thư mục này chưa có thư mục con nào."
                : "Chưa có thư mục nào. Hãy tạo thư mục đầu tiên!"}
            </TableCell>
          </TableRow>
        ) : (
          folders.map((folder) => (
            <FolderTableRow
              key={folder.path}
              folder={folder}
              checked={selected.has(folder.path)}
              setCurrentPath={setCurrentPath}
              setSelected={setSelected}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
});

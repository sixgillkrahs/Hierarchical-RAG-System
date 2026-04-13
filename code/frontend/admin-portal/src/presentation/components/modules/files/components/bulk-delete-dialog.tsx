import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { FolderItem } from "@/domain/entities/folder.entity";
import { useDeleteFolders } from "@/presentation/hooks/folders/useDeleteFolders";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../ui/alert-dialog";
import { Button } from "../../../ui/button";

type BulkDeleteDialogProps = {
  selected: FolderItem[];
  onDone: (remainingPaths: string[]) => void;
};

export function BulkDeleteDialog({
  selected,
  onDone,
}: BulkDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useDeleteFolders();

  const handleConfirm = async () => {
    try {
      const response = await mutateAsync({
        folder_paths: selected.map((folder) => folder.path),
      });
      const failedPaths = response.results
        .filter((result) => !result.success)
        .map((result) => result.folder_path);

      onDone(failedPaths);
      setOpen(false);

      if (response.failed === 0) {
        toast.success(`Đã xóa ${response.succeeded} thư mục.`);
        return;
      }

      if (response.succeeded > 0) {
        toast.warning(
          `Đã xóa ${response.succeeded}/${response.total} thư mục. ${response.failed} thư mục chưa xóa được.`,
        );
        return;
      }

      toast.error("Không thể xóa các thư mục đã chọn.");
    } catch {
      // handled by mutation cache
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Trash2 className="mr-2 size-4" />
          Xóa {selected.length} thư mục
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 className="size-5 text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>Xóa {selected.length} thư mục</AlertDialogTitle>
          <AlertDialogDescription>
            Các thư mục sau sẽ bị xóa vĩnh viễn cùng toàn bộ tệp bên trong:
            <ul className="mt-2 space-y-0.5 text-left">
              {selected.map((folder) => (
                <li key={folder.path} className="font-medium text-foreground">
                  • {folder.name}
                </li>
              ))}
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="sm" disabled={isPending}>
            Hủy bỏ
          </AlertDialogCancel>
          <AlertDialogAction
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => void handleConfirm()}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xóa tất cả"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

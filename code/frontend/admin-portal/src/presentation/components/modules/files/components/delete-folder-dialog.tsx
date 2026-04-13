import { Trash2 } from "lucide-react";
import type { FolderItem } from "@/domain/entities/folder.entity";
import { useDeleteFolder } from "@/presentation/hooks/folders/useDeleteFolder";
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

type DeleteFolderDialogProps = {
  folder: FolderItem;
};

export function DeleteFolderDialog({
  folder,
}: DeleteFolderDialogProps) {
  const { mutateAsync, isPending } = useDeleteFolder();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon-sm"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 className="size-5 text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>Xóa thư mục</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn xóa{" "}
            <span className="font-semibold text-foreground">
              "{folder.name}"
            </span>
            ? Toàn bộ tệp bên trong sẽ bị xóa vĩnh viễn.
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
            onClick={async () => {
              try {
                await mutateAsync({ folder_path: folder.path });
              } catch {
                // handled by mutation cache
              }
            }}
          >
            {isPending ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { useDeleteUser } from "@/presentation/hooks/users/useDeleteUser";
import { Trash2 } from "lucide-react";
import { memo } from "react";
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
} from "../../ui/alert-dialog";
import { Button } from "../../ui/button";

type DeleteUserDialogProps = {
  userId: string;
  userName: string;
};

const DeleteUserDialog = memo(({ userId, userName }: DeleteUserDialogProps) => {
  const { mutateAsync, isPending } = useDeleteUser();

  const handleConfirm = async () => {
    try {
      await mutateAsync(userId);
    } catch {
      // toast is handled in meta
    }
  };

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
          <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn xóa
            <span className="font-semibold text-foreground"> "{userName}"</span>
            ? Hành động này không thể hoàn tác.
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
            onClick={handleConfirm}
          >
            {isPending ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

DeleteUserDialog.displayName = "DeleteUserDialog";

export { DeleteUserDialog };

import { memo } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../ui/button";
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
import { useDeleteRole } from "@/presentation/hooks/roles/useDeleteRole";

type DeleteRoleDialogProps = {
  roleId: string;
  roleName: string;
};

const DeleteRoleDialog = memo(({ roleId, roleName }: DeleteRoleDialogProps) => {
  const { mutateAsync: deleteRole, isPending } = useDeleteRole();

  const handleConfirm = async () => {
    try {
      const response = await deleteRole(roleId);
      toast.success(response.message || `Đã xóa vai trò "${roleName}"`);
    } catch (error: any) {
      toast.error("Xóa vai trò thất bại", {
        description: error?.message || "Đã có lỗi xảy ra trên server.",
      });
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
          <AlertDialogTitle>Xác nhận xóa vai trò</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn xóa vai trò{" "}
            <span className="font-semibold text-foreground">"{roleName}"</span>?
            Hành động này không thể hoàn tác.
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
            {isPending ? "Đang xóa..." : "Xóa vai trò"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

DeleteRoleDialog.displayName = "DeleteRoleDialog";

export { DeleteRoleDialog };

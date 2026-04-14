import { memo } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useDeletePermission } from "@/presentation/hooks/useDeletePermission";
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

type DeletePermissionDialogProps = {
  permissionCode: string;
  permissionId: string;
};

const DeletePermissionDialog = memo(
  ({ permissionCode, permissionId }: DeletePermissionDialogProps) => {
    const { mutateAsync: deletePermission, isPending } = useDeletePermission();

    const handleConfirm = async () => {
      try {
        const response = await deletePermission(permissionId);
        toast.success(response.message || `Deleted permission "${permissionCode}"`);
      } catch (error: any) {
        toast.error("Could not delete permission", {
          description:
            error?.message || "The server returned an unexpected error.",
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
            <AlertDialogTitle>Delete permission</AlertDialogTitle>
            <AlertDialogDescription>
              Delete{" "}
              <span className="font-semibold text-foreground">
                "{permissionCode}"
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm" disabled={isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={handleConfirm}
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);

DeletePermissionDialog.displayName = "DeletePermissionDialog";

export { DeletePermissionDialog };

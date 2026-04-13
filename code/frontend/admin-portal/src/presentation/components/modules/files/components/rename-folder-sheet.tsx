import { useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import type { FolderItem } from "@/domain/entities/folder.entity";
import { useRenameFolder } from "@/presentation/hooks/folders/useRenameFolder";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../ui/sheet";

type RenameFolderSheetProps = {
  folder: FolderItem;
};

export function RenameFolderSheet({
  folder,
}: RenameFolderSheetProps) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const { mutateAsync, isPending } = useRenameFolder();

  const parentPath = folder.path.includes("/")
    ? folder.path.split("/").slice(0, -1).join("/")
    : "";

  const handleSubmit = async () => {
    const newPath = parentPath
      ? `${parentPath}/${newName.trim()}`
      : newName.trim();

    if (!newPath || newPath === folder.path) {
      return;
    }

    try {
      await mutateAsync({ current_path: folder.path, new_path: newPath });
      setOpen(false);
    } catch {
      // handled by mutation cache
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value) {
          setNewName(folder.name);
        }
      }}
    >
      <SheetTrigger asChild>
        <Button
          size="icon-sm"
          variant="ghost"
          className="text-muted-foreground"
        >
          <Pencil className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Đổi tên thư mục</SheetTitle>
          <SheetDescription>
            Hiện tại:{" "}
            <code className="rounded bg-muted px-1 text-xs">{folder.path}</code>
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 py-6">
          <div className="space-y-2">
            <Label>Tên mới</Label>
            <Input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleSubmit();
                }
              }}
            />
            {newName && newName !== folder.name && (
              <p className="text-xs text-muted-foreground">
                Đường dẫn mới:{" "}
                <code className="rounded bg-muted px-1">
                  {parentPath ? `${parentPath}/${newName}` : newName}
                </code>
              </p>
            )}
          </div>
        </div>
        <SheetFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={isPending || !newName.trim() || newName === folder.name}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Lưu tên mới
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

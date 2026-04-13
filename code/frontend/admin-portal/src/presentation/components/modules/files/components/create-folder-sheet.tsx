import { useState } from "react";
import { FolderPlus, Loader2 } from "lucide-react";
import { useCreateFolder } from "@/presentation/hooks/folders/useCreateFolder";
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

type CreateFolderSheetProps = {
  currentPath: string;
};

export function CreateFolderSheet({
  currentPath,
}: CreateFolderSheetProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { mutateAsync, isPending } = useCreateFolder();

  const handleSubmit = async () => {
    const folderPath = currentPath
      ? `${currentPath}/${name.trim()}`
      : name.trim();

    if (!folderPath) {
      return;
    }

    try {
      await mutateAsync({ folder_path: folderPath });
      setName("");
      setOpen(false);
    } catch {
      // handled by mutation cache
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm">
          <FolderPlus className="mr-2 size-4" />
          Tạo thư mục
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Tạo thư mục mới</SheetTitle>
          <SheetDescription>
            Tạo trong{" "}
            <code className="rounded bg-muted px-1 text-xs">
              {currentPath || "root"}
            </code>
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 py-6">
          <div className="space-y-2">
            <Label>Tên thư mục</Label>
            <Input
              placeholder="VD: contracts, 2026, reports..."
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleSubmit();
                }
              }}
            />
            {currentPath && name && (
              <p className="text-xs text-muted-foreground">
                Đường dẫn đầy đủ:{" "}
                <code className="rounded bg-muted px-1">
                  {currentPath}/{name}
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
            disabled={isPending || !name.trim()}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Tạo thư mục
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

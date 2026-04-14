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
  disabled?: boolean;
};

export function CreateFolderSheet({
  currentPath,
  disabled = false,
}: CreateFolderSheetProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { mutateAsync, isPending } = useCreateFolder();

  const handleSubmit = async () => {
    const folderPath = currentPath
      ? `${currentPath}/${name.trim()}`
      : name.trim();

    if (!folderPath || disabled) {
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

  const handleOpenChange = (nextOpen: boolean) => {
    if (disabled && nextOpen) {
      return;
    }

    setOpen(nextOpen);

    if (!nextOpen) {
      setName("");
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button size="sm" disabled={disabled}>
          <FolderPlus className="mr-2 size-4" />
          Create folder
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Create folder</SheetTitle>
          <SheetDescription>
            Create a new prefix inside{" "}
            <code className="rounded bg-muted px-1 text-xs">
              {currentPath || "root"}
            </code>
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 py-6">
          <div className="space-y-2">
            <Label>Folder name</Label>
            <Input
              placeholder="contracts, 2026, reports"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleSubmit();
                }
              }}
              disabled={disabled || isPending}
            />
            {currentPath && name && (
              <p className="text-xs text-muted-foreground">
                Full path:{" "}
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
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={disabled || isPending || !name.trim()}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Create folder
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

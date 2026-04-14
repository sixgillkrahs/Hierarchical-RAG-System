import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { useUploadDocument } from "@/presentation/hooks/documents/useUploadDocument";
import { Badge } from "../../../ui/badge";
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

type UploadDocumentSheetProps = {
  currentPath: string;
  disabled?: boolean;
};

const formatPreviewSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export function UploadDocumentSheet({
  currentPath,
  disabled = false,
}: UploadDocumentSheetProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { mutateAsync, isPending } = useUploadDocument();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      return;
    }

    try {
      await mutateAsync({
        file,
        folderPath: currentPath || undefined,
      });
      setFile(null);
      setOpen(false);
    } catch {
      // handled by mutation cache
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button size="sm" disabled={disabled}>
          <Upload className="mr-2 size-4" />
          Upload document
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Upload internal document</SheetTitle>
          <SheetDescription>
            Files are stored in{" "}
            <code className="rounded bg-muted px-1 text-xs">
              {currentPath || "root"}
            </code>{" "}
            and indexed with PostgreSQL metadata.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-4 py-6">
          <div className="space-y-2">
            <Label htmlFor="document-upload">File</Label>
            <Input
              id="document-upload"
              type="file"
              onChange={(event) =>
                setFile(event.target.files?.item(0) ?? null)
              }
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Upload one document at a time through the internal storage flow.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Destination path
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {currentPath || "root"}
                </p>
              </div>
              <Badge variant="secondary">MinIO + PostgreSQL</Badge>
            </div>

            {file && (
              <div className="mt-4 rounded-lg border border-border/70 bg-background/80 px-3 py-2">
                <p className="truncate text-sm font-medium text-foreground">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPreviewSize(file.size)}
                </p>
              </div>
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
          <Button onClick={() => void handleSubmit()} disabled={isPending || !file}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Upload
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useFolders } from "@/presentation/hooks/folders/useFolders";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { FolderBulkToolbar } from "./components/folder-bulk-toolbar";
import { FolderBreadcrumb } from "./components/folder-breadcrumb";
import { FolderTable } from "./components/folder-table";
import { CreateFolderSheet } from "./components/create-folder-sheet";

const Files = () => {
  const [currentPath, setCurrentPath] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data, isLoading, isError, refetch, isFetching } =
    useFolders(currentPath);

  const folders = data?.folders ?? [];
  const bucket = data?.bucket ?? "";
  const selectedFolders = folders.filter((folder) => selected.has(folder.path));

  return (
    <section className="space-y-6">
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl">Quản lý thư mục</CardTitle>
            <CardDescription>
              Duyệt và quản lý thư mục (prefix) trên MinIO.
              {bucket && (
                <span className="ml-2">
                  Bucket:{" "}
                  <Badge variant="secondary" className="font-mono text-xs">
                    {bucket}
                  </Badge>
                </span>
              )}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Làm mới
            </Button>
            <CreateFolderSheet currentPath={currentPath} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-md border border-border/60 bg-muted/30 px-4 py-2.5">
            <FolderBreadcrumb
              path={currentPath}
              setCurrentPath={setCurrentPath}
              setSelected={setSelected}
            />
          </div>

          {selectedFolders.length > 0 && (
            <FolderBulkToolbar
              selected={selectedFolders}
              setSelected={setSelected}
            />
          )}

          {isError ? (
            <p className="py-8 text-center text-sm text-destructive">
              Không thể tải danh sách thư mục. Vui lòng thử lại.
            </p>
          ) : (
            <FolderTable
              currentPath={currentPath}
              folders={folders}
              isLoading={isLoading}
              selected={selected}
              setCurrentPath={setCurrentPath}
              setSelected={setSelected}
            />
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default Files;

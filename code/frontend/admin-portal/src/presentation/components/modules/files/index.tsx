import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useDocuments } from "@/presentation/hooks/documents/useDocuments";
import { useFolders } from "@/presentation/hooks/folders/useFolders";
import { useAuthSession } from "@/shared/auth/auth-session";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { CreateFolderSheet } from "./components/create-folder-sheet";
import { DocumentsTable } from "./components/documents-table";
import { FolderBreadcrumb } from "./components/folder-breadcrumb";
import { FolderBulkToolbar } from "./components/folder-bulk-toolbar";
import { FolderTable } from "./components/folder-table";
import { UploadDocumentSheet } from "./components/upload-document-sheet";

const Files = () => {
  const [currentPath, setCurrentPath] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: session } = useAuthSession();
  const canReadDocuments =
    session?.permissions?.includes("storage.read") ||
    session?.permissions?.includes("storage.manage") ||
    false;
  const canManageDocuments =
    session?.permissions?.includes("storage.manage") || false;
  const {
    data,
    isLoading: isFoldersLoading,
    isError: isFoldersError,
    refetch: refetchFolders,
    isFetching: isFoldersFetching,
  } = useFolders(currentPath);
  const {
    data: documents,
    isLoading: isDocumentsLoading,
    isError: isDocumentsError,
    refetch: refetchDocuments,
    isFetching: isDocumentsFetching,
  } = useDocuments(currentPath, canReadDocuments);

  const folders = data?.folders ?? [];
  const bucket = data?.bucket ?? "";
  const selectedFolders = folders.filter((folder) => selected.has(folder.path));
  const documentItems = documents ?? [];
  const isRefreshing = isFoldersFetching || isDocumentsFetching;

  return (
    <section className="space-y-6">
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl">Document storage</CardTitle>
            <CardDescription>
              Browse MinIO folders, upload internal documents, and view the
              metadata synced into PostgreSQL.
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
              onClick={() => {
                void Promise.all([
                  refetchFolders(),
                  canReadDocuments ? refetchDocuments() : Promise.resolve(),
                ]);
              }}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`mr-2 size-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-md border border-border/60 bg-muted/30 px-4 py-2.5">
            <FolderBreadcrumb
              path={currentPath}
              setCurrentPath={setCurrentPath}
              setSelected={setSelected}
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">
                  Folders
                </h2>
                <p className="text-sm text-muted-foreground">
                  Create and manage MinIO folder prefixes for internal documents.
                </p>
              </div>

              <CreateFolderSheet currentPath={currentPath} />
            </div>

            {selectedFolders.length > 0 && (
              <FolderBulkToolbar
                selected={selectedFolders}
                setSelected={setSelected}
              />
            )}

            {isFoldersError ? (
              <p className="py-8 text-center text-sm text-destructive">
                Could not load folders. Try again.
              </p>
            ) : (
              <FolderTable
                currentPath={currentPath}
                folders={folders}
                isLoading={isFoldersLoading}
                selected={selected}
                setCurrentPath={setCurrentPath}
                setSelected={setSelected}
              />
            )}
          </div>

          <div className="space-y-4 border-t border-border/60 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">
                  Documents
                </h2>
                <p className="text-sm text-muted-foreground">
                  Upload files into MinIO and review the metadata stored for the
                  current folder path.
                </p>
              </div>

              <div className="flex flex-col items-start gap-2 sm:items-end">
                <UploadDocumentSheet
                  currentPath={currentPath}
                  disabled={!canManageDocuments}
                />
                {!canManageDocuments && (
                  <p className="text-xs text-muted-foreground">
                    You need `storage.manage` to upload documents.
                  </p>
                )}
              </div>
            </div>

            {!canReadDocuments ? (
              <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                You do not have permission to view document metadata.
              </p>
            ) : isDocumentsError ? (
              <p className="py-8 text-center text-sm text-destructive">
                Could not load documents. Try again.
              </p>
            ) : (
              <DocumentsTable
                currentPath={currentPath}
                documents={documentItems}
                isLoading={isDocumentsLoading}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default Files;

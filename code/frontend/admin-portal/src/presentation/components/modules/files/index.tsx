import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useDocuments } from "@/presentation/hooks/documents/useDocuments";
import { useFolders } from "@/presentation/hooks/folders/useFolders";
import { useAuthSession } from "@/shared/auth/auth-session";
import {
  canManageStoragePath,
  canReadStoragePath,
  canTraverseStoragePath,
} from "@/shared/auth/storage-scope";
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
  const storageScopes = session?.storageScopes ?? [];
  const hasStorageReadPermission =
    session?.permissions?.includes("storage.read") ||
    session?.permissions?.includes("storage.manage") ||
    false;
  const hasStorageManagePermission =
    session?.permissions?.includes("storage.manage") || false;
  const hasStorageScopes = storageScopes.length > 0;
  const canTraverseCurrentPath =
    hasStorageReadPermission &&
    hasStorageScopes &&
    canTraverseStoragePath(currentPath, storageScopes);
  const canReadCurrentPath =
    hasStorageReadPermission &&
    hasStorageScopes &&
    canReadStoragePath(currentPath, storageScopes);
  const canManageCurrentPath =
    hasStorageManagePermission &&
    hasStorageScopes &&
    canManageStoragePath(currentPath, storageScopes);
  const {
    data,
    isLoading: isFoldersLoading,
    isError: isFoldersError,
    refetch: refetchFolders,
    isFetching: isFoldersFetching,
  } = useFolders(currentPath, canTraverseCurrentPath);
  const {
    data: documents,
    isLoading: isDocumentsLoading,
    isError: isDocumentsError,
    refetch: refetchDocuments,
    isFetching: isDocumentsFetching,
  } = useDocuments(currentPath, canReadCurrentPath);

  const folders = data?.folders ?? [];
  const bucket = data?.bucket ?? "";
  const canManagePath = (path: string) =>
    hasStorageManagePermission && canManageStoragePath(path, storageScopes);
  const selectedFolders = folders.filter(
    (folder) => selected.has(folder.path) && canManagePath(folder.path),
  );
  const documentItems = documents ?? [];
  const isRefreshing = isFoldersFetching || isDocumentsFetching;
  const showNoScopeState = hasStorageReadPermission && !hasStorageScopes;

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
                  canTraverseCurrentPath ? refetchFolders() : Promise.resolve(),
                  canReadCurrentPath ? refetchDocuments() : Promise.resolve(),
                ]);
              }}
              disabled={isRefreshing || (!canTraverseCurrentPath && !canReadCurrentPath)}
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

              <div className="flex flex-col items-start gap-2 sm:items-end">
                <CreateFolderSheet
                  currentPath={currentPath}
                  disabled={!canManageCurrentPath}
                />
                {!showNoScopeState && !canManageCurrentPath && canTraverseCurrentPath && (
                  <p className="text-xs text-muted-foreground">
                    This folder is visible, but not writable for your role.
                  </p>
                )}
              </div>
            </div>

            {selectedFolders.length > 0 && (
              <FolderBulkToolbar
                selected={selectedFolders}
                setSelected={setSelected}
              />
            )}

            {showNoScopeState ? (
              <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                Your account has storage permissions but no storage subtree scope yet.
              </p>
            ) : !canTraverseCurrentPath ? (
              <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                You cannot browse this folder path with the current storage scopes.
              </p>
            ) : isFoldersError ? (
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
                canManagePath={canManagePath}
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
                  disabled={!canManageCurrentPath}
                />
                {!showNoScopeState && !canManageCurrentPath && canReadCurrentPath && (
                  <p className="text-xs text-muted-foreground">
                    You can view this folder, but uploads require a matching
                    manage scope.
                  </p>
                )}
              </div>
            </div>

            {!hasStorageReadPermission ? (
              <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                You do not have permission to view document metadata.
              </p>
            ) : showNoScopeState ? (
              <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                No document subtree is assigned to your current role set.
              </p>
            ) : !canReadCurrentPath ? (
              <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                This folder is only part of your navigation path. Document
                metadata becomes visible once you enter a folder covered by a
                read or manage scope.
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

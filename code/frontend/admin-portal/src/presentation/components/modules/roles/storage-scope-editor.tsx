import { Check, ChevronRight, FolderOpen, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { StorageScope, StorageScopeCapability } from "@/domain/entities/role.entity";
import { cn } from "@/infrastructure/lib/utils";
import { useStorageScopeFolders } from "@/presentation/hooks/roles/useStorageScopeFolders";
import { normalizeStoragePath } from "@/shared/auth/storage-scope";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import {
  buildStorageScopePreview,
  formatStorageScopePath,
  getStorageScopeTargetLabel,
  STORAGE_SCOPE_CAPABILITY_COPY,
  STORAGE_SCOPE_INHERITANCE_COPY,
} from "./storage-scope-copy";

type StorageScopeEditorProps = {
  disabled?: boolean;
  enabled?: boolean;
  onChange: (scopes: StorageScope[]) => void;
  value: StorageScope[];
};

type FolderTreeNodeProps = {
  disabled: boolean;
  enabled: boolean;
  expandedPaths: Set<string>;
  level: number;
  path: string;
  selectedPath: string;
  setExpandedPaths: Dispatch<SetStateAction<Set<string>>>;
  setSelectedPath: (path: string) => void;
};

const createEmptyScope = (pathPrefix = ""): StorageScope => ({
  pathPrefix: normalizeStoragePath(pathPrefix),
  capability: "read",
  inheritChildren: true,
});

const getAncestorPaths = (path: string) => {
  const parts = normalizeStoragePath(path).split("/").filter(Boolean);

  return parts.map((_, index) => parts.slice(0, index + 1).join("/"));
};

function FolderTreeNode({
  disabled,
  enabled,
  expandedPaths,
  level,
  path,
  selectedPath,
  setExpandedPaths,
  setSelectedPath,
}: FolderTreeNodeProps) {
  const isExpanded = expandedPaths.has(path);
  const isSelected = selectedPath === path;
  const { data, isLoading } = useStorageScopeFolders(path, enabled && isExpanded);
  const childFolders = data?.folders ?? [];
  const hasLoadedChildren = isExpanded && !isLoading;
  const isLeaf = hasLoadedChildren && childFolders.length === 0;

  const toggleExpanded = () => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);

      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }

      return next;
    });
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors",
          isSelected ? "bg-primary/10" : "hover:bg-muted/40",
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <button
          type="button"
          onClick={toggleExpanded}
          disabled={disabled}
          className={cn(
            "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            isExpanded && "text-foreground",
          )}
          aria-label={isExpanded ? `Collapse ${path}` : `Expand ${path}`}
        >
          <ChevronRight
            className={cn("size-4 transition-transform", isExpanded && "rotate-90")}
          />
        </button>

        <button
          type="button"
          onClick={() => setSelectedPath(path)}
          disabled={disabled}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <FolderOpen className="size-4 shrink-0 text-yellow-500" />
          <span className="truncate text-sm font-medium text-foreground">
            {path.split("/").at(-1)}
          </span>
          {isSelected ? (
            <Check className="size-4 shrink-0 text-primary" />
          ) : isLeaf ? (
            <span className="text-xs text-muted-foreground">leaf</span>
          ) : null}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-1">
          {isLoading ? (
            <p
              className="px-2 py-1 text-xs text-muted-foreground"
              style={{ paddingLeft: `${level * 16 + 44}px` }}
            >
              Loading...
            </p>
          ) : childFolders.length === 0 ? (
            <p
              className="px-2 py-1 text-xs text-muted-foreground"
              style={{ paddingLeft: `${level * 16 + 44}px` }}
            >
              No child folders
            </p>
          ) : (
            childFolders.map((folder) => (
              <FolderTreeNode
                key={folder.path}
                disabled={disabled}
                enabled={enabled}
                expandedPaths={expandedPaths}
                level={level + 1}
                path={folder.path}
                selectedPath={selectedPath}
                setExpandedPaths={setExpandedPaths}
                setSelectedPath={setSelectedPath}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function StorageScopeEditor({
  disabled = false,
  enabled = true,
  onChange,
  value,
}: StorageScopeEditorProps) {
  const [selectedPath, setSelectedPathState] = useState("");
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const { data: rootData, isLoading, isError } = useStorageScopeFolders("", enabled);
  const rootFolders = rootData?.folders ?? [];

  const uniqueScopePaths = useMemo(
    () =>
      Array.from(
        new Set(
          value
            .map((scope) => normalizeStoragePath(scope.pathPrefix))
            .filter((path) => path.length > 0),
        ),
      ),
    [value],
  );

  const selectPath = (path: string) => {
    const normalizedPath = normalizeStoragePath(path);
    setSelectedPathState(normalizedPath);

    if (!normalizedPath) {
      return;
    }

    setExpandedPaths((prev) => {
      const next = new Set(prev);

      for (const ancestor of getAncestorPaths(normalizedPath)) {
        next.add(ancestor);
      }

      return next;
    });
  };

  const updateScope = <K extends keyof StorageScope>(
    index: number,
    key: K,
    nextValue: StorageScope[K],
  ) => {
    const nextScopes = value.map((scope, scopeIndex) =>
      scopeIndex === index ? { ...scope, [key]: nextValue } : scope,
    );

    onChange(nextScopes);
  };

  const updateScopePath = (index: number, nextPath: string) => {
    updateScope(index, "pathPrefix", normalizeStoragePath(nextPath));
  };

  const removeScope = (index: number) => {
    onChange(value.filter((_, scopeIndex) => scopeIndex !== index));
  };

  const addScope = (pathPrefix = "") => {
    const normalizedPath = normalizeStoragePath(pathPrefix);
    const existingIndex = value.findIndex(
      (scope) =>
        normalizeStoragePath(scope.pathPrefix) === normalizedPath &&
        scope.capability === "read",
    );

    if (existingIndex >= 0) {
      selectPath(normalizedPath);
      return;
    }

    onChange([...value, createEmptyScope(normalizedPath)]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Storage scopes</p>
          <p className="text-xs text-muted-foreground">
            Expand the tree, click a folder to select it, then assign the role's
            access for that subtree.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              selectPath("");
              addScope("");
            }}
            disabled={disabled}
          >
            <Plus className="mr-2 size-4" />
            Add root scope
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => addScope(selectedPath)}
            disabled={disabled}
          >
            <Plus className="mr-2 size-4" />
            Add selected folder
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Folder tree</p>
            <p className="text-xs text-muted-foreground">
              Expand folders to drill into the hierarchy. Clicking a node sets the
              current folder selection.
            </p>
          </div>

          <div className="mt-4 max-h-80 overflow-y-auto rounded-lg border border-border/60 bg-background/80 p-2">
            <div className="space-y-1">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors",
                  selectedPath === "" ? "bg-primary/10" : "hover:bg-muted/40",
                )}
              >
                <button
                  type="button"
                  onClick={() => selectPath("")}
                  disabled={disabled}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <FolderOpen className="size-4 shrink-0 text-yellow-500" />
                  <span className="text-sm font-medium text-foreground">
                    Storage root
                  </span>
                  {selectedPath === "" && (
                    <Check className="size-4 shrink-0 text-primary" />
                  )}
                </button>
              </div>

              {isLoading ? (
                <p className="px-2 py-2 text-sm text-muted-foreground">
                  Loading folders...
                </p>
              ) : isError ? (
                <p className="px-2 py-2 text-sm text-destructive">
                  Could not load folders for the scope tree.
                </p>
              ) : rootFolders.length === 0 ? (
                <p className="px-2 py-2 text-sm text-muted-foreground">
                  No folders available yet.
                </p>
              ) : (
                rootFolders.map((folder) => (
                  <FolderTreeNode
                    key={folder.path}
                    disabled={disabled}
                    enabled={enabled}
                    expandedPaths={expandedPaths}
                    level={0}
                    path={folder.path}
                    selectedPath={selectedPath}
                    setExpandedPaths={setExpandedPaths}
                    setSelectedPath={selectPath}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Current selection</p>
            <p className="text-xs text-muted-foreground">
              Use the selected folder to create a new scope or apply it to an
              existing scope card below.
            </p>
          </div>

          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{formatStorageScopePath(selectedPath)}</Badge>
                <Badge variant="outline">
                  {getStorageScopeTargetLabel(selectedPath)}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {selectedPath
                  ? `New scopes created now will start from ${formatStorageScopePath(selectedPath)}.`
                  : "Selecting root clears the path prefix and grants access from the storage root."}
              </p>
            </div>

            {uniqueScopePaths.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Existing scope folders
                </p>
                <div className="flex flex-wrap gap-2">
                  {uniqueScopePaths.map((path) => (
                    <Button
                      key={path}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => selectPath(path)}
                      disabled={disabled}
                    >
                      {formatStorageScopePath(path)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {value.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          No storage scope assigned to this role yet.
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((scope, index) => (
            <div
              key={scope.id ?? `scope-${index}`}
              className="space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {formatStorageScopePath(scope.pathPrefix)}
                    </Badge>
                    <Badge
                      variant={STORAGE_SCOPE_CAPABILITY_COPY[scope.capability].badgeVariant}
                    >
                      {STORAGE_SCOPE_CAPABILITY_COPY[scope.capability].label}
                    </Badge>
                    <Badge variant="outline">
                      {scope.inheritChildren
                        ? STORAGE_SCOPE_INHERITANCE_COPY.children.label
                        : STORAGE_SCOPE_INHERITANCE_COPY.exact.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {buildStorageScopePreview(scope)}
                  </p>
                </div>

                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => removeScope(index)}
                  disabled={disabled}
                  className="text-destructive hover:bg-destructive/10"
                  aria-label={`Remove storage scope ${index + 1}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="space-y-2">
                  <Label htmlFor={`storage-scope-capability-${index}`}>
                    Access level
                  </Label>
                  <select
                    id={`storage-scope-capability-${index}`}
                    value={scope.capability}
                    onChange={(event) =>
                      updateScope(
                        index,
                        "capability",
                        event.target.value as StorageScopeCapability,
                      )
                    }
                    disabled={disabled}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                    <option value="read">
                      {STORAGE_SCOPE_CAPABILITY_COPY.read.label}
                    </option>
                    <option value="manage">
                      {STORAGE_SCOPE_CAPABILITY_COPY.manage.label}
                    </option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    {STORAGE_SCOPE_CAPABILITY_COPY[scope.capability].description}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/80 px-3 py-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {scope.inheritChildren
                        ? STORAGE_SCOPE_INHERITANCE_COPY.children.label
                        : STORAGE_SCOPE_INHERITANCE_COPY.exact.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {scope.inheritChildren
                        ? STORAGE_SCOPE_INHERITANCE_COPY.children.description
                        : STORAGE_SCOPE_INHERITANCE_COPY.exact.description}
                    </p>
                  </div>
                  <Switch
                    checked={scope.inheritChildren}
                    onCheckedChange={(checked) =>
                      updateScope(index, "inheritChildren", Boolean(checked))
                    }
                    disabled={disabled}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => updateScopePath(index, selectedPath)}
                  disabled={disabled}
                >
                  Apply selected folder
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => selectPath(scope.pathPrefix)}
                  disabled={disabled}
                >
                  Focus this scope in tree
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => updateScopePath(index, "")}
                  disabled={disabled}
                >
                  Clear to root
                </Button>
              </div>

              <details className="rounded-lg border border-dashed border-border/70 bg-background/60 px-4 py-3">
                <summary className="cursor-pointer text-sm font-medium text-foreground">
                  Advanced: edit path manually
                </summary>
                <div className="mt-3 space-y-2">
                  <Label htmlFor={`storage-scope-path-${index}`}>Path prefix</Label>
                  <Input
                    id={`storage-scope-path-${index}`}
                    placeholder="cto/contracts"
                    value={scope.pathPrefix}
                    onChange={(event) =>
                      updateScopePath(index, event.target.value)
                    }
                    disabled={disabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to grant access from the storage root.
                  </p>
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

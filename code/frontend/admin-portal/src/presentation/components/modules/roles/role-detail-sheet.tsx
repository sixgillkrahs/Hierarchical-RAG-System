import { Eye } from "lucide-react";
import { memo, useState } from "react";
import type { RoleEntity } from "@/domain/entities/role.entity";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import {
  buildStorageScopePreview,
  formatStorageScopePath,
  STORAGE_SCOPE_CAPABILITY_COPY,
  STORAGE_SCOPE_INHERITANCE_COPY,
} from "./storage-scope-copy";

type RoleDetailSheetProps = {
  role: RoleEntity;
};

const RoleDetailSheet = memo(({ role }: RoleDetailSheetProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon-sm" variant="ghost" className="text-muted-foreground">
          <Eye className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{role.name}</SheetTitle>
          <SheetDescription>{role.description}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Permissions
              </p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {role.permissions.length}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Storage scopes
              </p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {role.storageScopes.length}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Permission list
            </p>
            {role.permissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No permissions assigned to this role.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <Badge
                    key={permission}
                    variant="outline"
                    className="font-mono text-xs"
                  >
                    {permission}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Storage subtree access
            </p>
            {role.storageScopes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No storage scopes assigned to this role.
              </p>
            ) : (
              <div className="space-y-3">
                {role.storageScopes.map((scope, index) => (
                  <div
                    key={scope.id ?? `${scope.pathPrefix}-${scope.capability}-${index}`}
                    className="rounded-xl border border-border/70 bg-muted/20 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {formatStorageScopePath(scope.pathPrefix)}
                      </Badge>
                      <Badge
                        variant={STORAGE_SCOPE_CAPABILITY_COPY[scope.capability].badgeVariant}
                        className="text-xs"
                      >
                        {STORAGE_SCOPE_CAPABILITY_COPY[scope.capability].label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {scope.inheritChildren
                          ? STORAGE_SCOPE_INHERITANCE_COPY.children.label
                          : STORAGE_SCOPE_INHERITANCE_COPY.exact.label}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {buildStorageScopePreview(scope)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
});

RoleDetailSheet.displayName = "RoleDetailSheet";

export { RoleDetailSheet };

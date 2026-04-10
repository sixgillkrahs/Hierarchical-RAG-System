import { memo } from "react";
import { Eye } from "lucide-react";
import { useState } from "react";
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

type RoleRow = {
  id: string;
  name: string;
  description: string;
  permissions?: string[];
  permissionIds?: string[];
};

type RoleDetailSheetProps = {
  role: RoleRow;
};

const RoleDetailSheet = memo(({ role }: RoleDetailSheetProps) => {
  const [open, setOpen] = useState(false);
  const permissions = role.permissions ?? [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="ghost">
          <Eye className="size-4" />
          Chi tiết
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{role.name}</SheetTitle>
          <SheetDescription>{role.description}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Tổng quyền
              </p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {permissions.length}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                UUID
              </p>
              <p className="mt-1 break-all text-[11px] font-mono text-muted-foreground">
                {role.id}
              </p>
            </div>
          </div>

          {/* Permissions list */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Danh sách quyền
            </p>
            {permissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa có quyền nào được gán vào vai trò này.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {permissions.map((perm) => (
                  <Badge key={perm} variant="outline" className="font-mono text-xs">
                    {perm}
                  </Badge>
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

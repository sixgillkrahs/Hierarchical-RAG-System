import { memo, useState } from "react";
import { Eye } from "lucide-react";
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

type UserDetailSheetProps = {
  user: any;
};

const UserDetailSheet = memo(({ user }: UserDetailSheetProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon-sm" variant="ghost" className="text-muted-foreground">
          <Eye className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{user.displayName}</SheetTitle>
          <SheetDescription>{user.email}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Trạng thái
            </p>
            <Badge variant={user.isActive ? "success" : "destructive" as any}>{user.isActive ? "Hoạt động" : "Bị khoá"}</Badge>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Rủi ro & Review
            </p>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                Tạo lúc: {new Date(user.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Vai trò (Roles)
            </p>
            {user.roles && user.roles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role: string) => (
                  <Badge key={role} variant="outline" className="font-mono text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Chưa có vai trò nào.
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
});

UserDetailSheet.displayName = "UserDetailSheet";

export { UserDetailSheet };

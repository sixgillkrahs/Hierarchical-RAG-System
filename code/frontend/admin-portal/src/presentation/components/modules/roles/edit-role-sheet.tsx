import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "../../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import { useUpdateRole } from "@/presentation/hooks/roles/useUpdateRole";
import { usePermissions } from "@/presentation/hooks/usePermissions";

type RoleRow = {
  id: string;
  name: string;
  description: string;
  permissionIds?: string[];
};

type EditRoleSheetProps = {
  role: RoleRow;
};

const formSchema = z.object({
  name: z.string().min(2, "Tên vai trò phải có ít nhất 2 ký tự"),
  description: z.string().min(5, "Mô tả phải có ít nhất 5 ký tự"),
  permissionIds: z.array(z.string()),
});

const EditRoleSheet = memo(({ role }: EditRoleSheetProps) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync: updateRole, isPending } = useUpdateRole();
  const { data: allPermissions = [], isLoading: permissionsLoading } =
    usePermissions();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: role.name,
      description: role.description,
      permissionIds: role.permissionIds ?? [],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: role.name,
        description: role.description,
        permissionIds: role.permissionIds ?? [],
      });
    }
  }, [open, role, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await updateRole({
        id: role.id,
        name: values.name,
        description: values.description,
        permissionIds: values.permissionIds,
      });

      // Cache auto-refreshed via invalidation in useUpdateRole
      toast.success(response.message || "Cập nhật vai trò thành công");
      setOpen(false);
    } catch (error: any) {
      toast.error("Cập nhật vai trò thất bại", {
        description: error?.message || "Đã có lỗi xảy ra trên server.",
      });
    }
  };

  const togglePermission = (permId: string) => {
    const current = form.getValues("permissionIds");
    const updated = current.includes(permId)
      ? current.filter((id) => id !== permId)
      : [...current, permId];
    form.setValue("permissionIds", updated, { shouldDirty: true });
  };

  // Watch the selected ids to keep checkboxes in sync
  const selectedIds = form.watch("permissionIds");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon-sm" variant="ghost" className="text-muted-foreground">
          <Pencil className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Chỉnh sửa vai trò</SheetTitle>
          <SheetDescription>
            Cập nhật thông tin và quyền hạn của vai trò.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-full flex-col"
          >
            <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
              {/* Basic info */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên vai trò</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: content_editor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Chức năng của vai trò..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Permissions multi-select */}
              <div>
                <p className="mb-3 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Quyền hạn
                </p>
                {permissionsLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Đang tải quyền...
                  </p>
                ) : allPermissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Không có quyền nào trong hệ thống.
                  </p>
                ) : (
                  <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border border-border/70 p-2">
                    {allPermissions.map((perm) => {
                      const checked = selectedIds.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50"
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 size-4 shrink-0 accent-primary"
                            checked={checked}
                            onChange={() => togglePermission(perm.id)}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-mono font-medium">
                              {perm.code}
                            </p>
                            {perm.description && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {perm.description}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Đã chọn:{" "}
                  <span className="font-medium">{selectedIds.length}</span> /{" "}
                  {allPermissions.length} quyền
                </p>
              </div>
            </div>

            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Hủy bỏ
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
});

EditRoleSheet.displayName = "EditRoleSheet";

export { EditRoleSheet };

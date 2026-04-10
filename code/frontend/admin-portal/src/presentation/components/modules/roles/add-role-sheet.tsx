import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { memo, useState } from "react";
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
import { useCreateRole } from "@/presentation/hooks/useCreateRole";
import { usePermissions } from "@/presentation/hooks/usePermissions";

type AddRoleSheetProps = Record<string, never>;

const formSchema = z.object({
  name: z.string().min(2, "Tên vai trò phải có ít nhất 2 ký tự"),
  description: z.string().min(5, "Mô tả phải có ít nhất 5 ký tự"),
  permissionIds: z.array(z.string()),
});

const AddRoleSheet = memo((_props: AddRoleSheetProps) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createRole, isPending } = useCreateRole();
  const { data: allPermissions = [], isLoading: permissionsLoading } = usePermissions();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", permissionIds: [] },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await createRole({
        name: values.name,
        description: values.description,
        permissionIds: values.permissionIds,
      });

      // Cache auto-refreshed via invalidation in useCreateRole
      toast.success(response.message || "Đã thêm vai trò thành công");
      form.reset();
      setOpen(false);
    } catch (error: any) {
      toast.error("Thêm vai trò thất bại", {
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

  const selectedIds = form.watch("permissionIds");

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) form.reset();
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button className="sm:self-auto">
          <Plus className="size-4" />
          Thêm vai trò
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Thêm vai trò mới</SheetTitle>
          <SheetDescription>
            Tạo vai trò mới và gán quyền cho vai trò ngay khi tạo.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
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
                      <Input placeholder="Chức năng và phạm vi của vai trò..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Permissions multi-select */}
              <div>
                <p className="mb-3 text-sm font-medium leading-none">
                  Quyền hạn
                </p>
                {permissionsLoading ? (
                  <p className="text-sm text-muted-foreground">Đang tải quyền...</p>
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
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Hủy bỏ
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
});

AddRoleSheet.displayName = "AddRoleSheet";

export { AddRoleSheet };

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
import { useUpdatePermission } from "@/presentation/hooks/useUpdatePermission";

type PermissionRow = {
  id: string;      // permission UUID
  code: string;    // displayed "Mã quyền"
  route: string;   // displayed "Module/Route"
  description: string;
};

type EditPermissionSheetProps = {
  permission: PermissionRow;
  onUpdated: (updated: PermissionRow) => void;
};

const formSchema = z.object({
  code: z.string().min(3, "Mã quyền phải có ít nhất 3 ký tự"),
  route: z.string().min(1, "Route không được để trống"),
  description: z.string().optional(),
});

const EditPermissionSheet = memo(
  ({ permission, onUpdated }: EditPermissionSheetProps) => {
    const [open, setOpen] = useState(false);
    const { mutateAsync: updatePermission, isPending } = useUpdatePermission();

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        code: permission.code,
        route: permission.route,
        description: permission.description,
      },
    });

    // Sync form values when permission prop changes (e.g. after add)
    useEffect(() => {
      if (open) {
        form.reset({
          code: permission.code,
          route: permission.route,
          description: permission.description,
        });
      }
    }, [open, permission, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
      try {
        const response = await updatePermission({
          id: permission.id,
          code: values.code,
          route: values.route,
          description: values.description || "",
        });

        onUpdated({
          id: permission.id,
          code: response.permission?.code || values.code,
          route: response.permission?.route || values.route,
          description: response.permission?.description || values.description || "",
        });

        toast.success(response.message || "Cập nhật quyền thành công");
        setOpen(false);
      } catch (error: any) {
        toast.error("Cập nhật quyền thất bại", {
          description: error?.message || "Đã có lỗi xảy ra trên server.",
        });
      }
    };

    const handleOpenChange = (newOpen: boolean) => {
      setOpen(newOpen);
    };

    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          <Button size="sm" variant="outline">
            <Pencil className="size-4" />
            Chỉnh sửa
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Chỉnh sửa quyền</SheetTitle>
            <SheetDescription>
              Cập nhật thông tin quyền truy cập trong hệ thống.
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
              <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã quyền</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: users.write" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="route"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Route</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: /users" {...field} />
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
                        <Input placeholder="Chức năng của quyền..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    );
  },
);

EditPermissionSheet.displayName = "EditPermissionSheet";

export { EditPermissionSheet };

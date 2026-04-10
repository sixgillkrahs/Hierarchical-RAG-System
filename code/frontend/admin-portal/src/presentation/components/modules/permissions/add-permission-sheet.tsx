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
import { useCreatePermission } from "@/presentation/hooks/useCreatePermission";

type AddPermissionSheetProps = {
  onAdd: (permission: {
    id: string;
    module: string;
    description: string;
    status: string;
    statusVariant: "outline" | "destructive" | "warning" | "default" | "secondary";
  }) => void;
};

const formSchema = z.object({
  id: z.string().min(3, "Mã quyền phải có ít nhất 3 ký tự (VD: users.write)"),
  module: z.string().min(2, "Module phải có ít nhất 2 ký tự (VD: Users)"),
  description: z.string().optional(),
});

const AddPermissionSheet = memo(({ onAdd }: AddPermissionSheetProps) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createPermission, isPending } = useCreatePermission();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      module: "",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await createPermission({
        code: values.id,
        route: values.module,
        description: values.description || "",
      });

      onAdd({
        id: response.permission?.code || values.id,
        module: response.permission?.route || values.module,
        description: response.permission?.description || values.description || "",
        status: "Khởi tạo",
        statusVariant: "outline",
      });

      toast.success(response.message || "Đã thêm quyền thành công");
      form.reset();
      setOpen(false);
    } catch (error: any) {
      toast.error("Thêm quyền thất bại", {
        description: error?.message || "Đã có lỗi xảy ra trên server.",
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button className="sm:self-auto">
          <Plus className="size-4" />
          Thêm quyền
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Thêm quyền truy cập</SheetTitle>
          <SheetDescription>
            Tạo mới quyền điều hướng hoặc API cho hệ thống.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6">
              <FormField
                control={form.control}
                name="id"
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
                name="module"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module</FormLabel>
                    <FormControl>
                      <Input placeholder="Tên module (VD: Users)" {...field} />
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
                {isPending ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
});

AddPermissionSheet.displayName = "AddPermissionSheet";

export { AddPermissionSheet };

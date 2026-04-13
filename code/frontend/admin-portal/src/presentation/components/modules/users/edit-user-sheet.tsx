import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUpdateUser } from "@/presentation/hooks/users/useUpdateUser";

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
import { useRoles } from "@/presentation/hooks/roles/useRoles";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import { Switch } from "../../ui/switch";

const formSchema = z.object({
  name: z.string().min(2, "Tên bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  roles: z.array(z.string()),
  isActive: z.boolean(),
});

type EditUserSheetProps = {
  user: any;
};

const EditUserSheet = memo(({ user }: EditUserSheetProps) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useUpdateUser();

  const { data: rolesData, isLoading: rolesLoading } = useRoles({
    page: 1,
    limit: 100,
  });
  const allRoles = rolesData?.data ?? [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.displayName,
      email: user.email,
      roles: user.roles || [],
      isActive: user.isActive ?? true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: user.displayName,
        email: user.email,
        roles: user.roles || [],
        isActive: user.isActive ?? true,
      });
    }
  }, [open, user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const roleIds = allRoles
        .filter((r) => values.roles.includes(r.name))
        .map((r) => r.id);

      await mutateAsync({
        id: user.id,
        displayName: values.name,
        email: values.email,
        roleIds: roleIds,
        isActive: values.isActive,
      });

      setOpen(false);
    } catch {
      // error toast handled
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon-sm"
          variant="ghost"
          className="text-muted-foreground"
        >
          <Pencil className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Chỉnh sửa người dùng</SheetTitle>
          <SheetDescription>Cập nhật thông tin tài khoản.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-full flex-col"
          >
            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/70 p-3 shadow-sm mt-4">
                    <div className="space-y-0.5">
                      <FormLabel>Kích hoạt</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Cho phép người dùng đăng nhập vào hệ thống
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="mt-2">
                <p className="mb-3 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Vai trò
                </p>
                {rolesLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Đang tải vai trò...
                  </p>
                ) : allRoles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Không có vai trò nào trong hệ thống.
                  </p>
                ) : (
                  <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border border-border/70 p-2">
                    {allRoles.map((role) => {
                      const selectedRoles = form.watch("roles");
                      const checked = selectedRoles.includes(role.name);

                      const toggleRole = () => {
                        const updated = checked
                          ? selectedRoles.filter((name) => name !== role.name)
                          : [...selectedRoles, role.name];
                        form.setValue("roles", updated, { shouldDirty: true });
                      };

                      return (
                        <label
                          key={role.id}
                          className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50"
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 size-4 shrink-0 accent-primary"
                            checked={checked}
                            onChange={toggleRole}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-mono font-medium">
                              {role.name}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
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
                {isPending ? "Đang xử lý..." : "Lưu thay đổi"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
});

EditUserSheet.displayName = "EditUserSheet";

export { EditUserSheet };

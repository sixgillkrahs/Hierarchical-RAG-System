import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { memo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useRoles } from "@/presentation/hooks/roles/useRoles";
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
import { useCreateUser } from "@/presentation/hooks/users/useCreateUser";

const formSchema = z.object({
  name: z.string().min(2, "Tên bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  roles: z.array(z.string()),
});

const AddUserSheet = memo(() => {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useCreateUser();

  const { data: rolesData, isLoading: rolesLoading } = useRoles({
    page: 1,
    limit: 100,
  });
  const allRoles = rolesData?.data ?? [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roles: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Map role names back to IDs or send names if API accepts names.
      // Wait, backend expects roleIds?: string[];
      // The form roles is array of names right now because that's how we set it up visually.
      // Let's resolve the actual roleIds
      const roleIds = allRoles
        .filter((r) => values.roles.includes(r.name))
        .map((r) => r.id);

      await mutateAsync({
        displayName: values.name,
        email: values.email,
        password: values.password,
        roleIds: roleIds,
        isActive: true,
      });

      // Still call onAdd if parent needs it, but query invalidation handles the UI sync.
      setOpen(false);
      form.reset();
    } catch {
      // error is handled by mutation meta
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) form.reset();
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="-ml-1 mr-2 size-4" />
          Thêm người dùng
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Thêm người dùng</SheetTitle>
          <SheetDescription>
            Khai báo tài khoản người dùng mới vào hệ thống.
          </SheetDescription>
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
                      <Input placeholder="VD: Nguyễn Văn A" {...field} />
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
                    <FormLabel>Email liên hệ</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: a.nguyen@company.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Mật khẩu cấp cho người dùng"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Roles multi-select */}
              <div>
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
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Hủy bỏ
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang xử lý..." : "Thêm mới"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
});

AddUserSheet.displayName = "AddUserSheet";

export { AddUserSheet };

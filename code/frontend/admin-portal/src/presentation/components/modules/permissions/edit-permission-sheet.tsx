import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { PermissionEntity } from "@/domain/entities/permission.entity";
import { useUpdatePermission } from "@/presentation/hooks/useUpdatePermission";
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

type EditPermissionSheetProps = {
  permission: PermissionEntity;
};

const formSchema = z.object({
  code: z.string().min(3, "Permission code must be at least 3 characters."),
  route: z.string().min(1, "Route cannot be empty."),
  description: z.string().optional(),
});

const EditPermissionSheet = memo(({ permission }: EditPermissionSheetProps) => {
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

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      code: permission.code,
      route: permission.route,
      description: permission.description,
    });
  }, [form, open, permission]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await updatePermission({
        id: permission.id,
        code: values.code,
        route: values.route,
        description: values.description || "",
      });

      toast.success(response.message || "Permission updated successfully.");
      setOpen(false);
    } catch (error: any) {
      toast.error("Could not update permission", {
        description: error?.message || "The server returned an unexpected error.",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon-sm" variant="ghost" className="text-muted-foreground">
          <Pencil className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit permission</SheetTitle>
          <SheetDescription>
            Update the permission code, route, or description.
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
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission code</FormLabel>
                    <FormControl>
                      <Input placeholder="users.read" {...field} />
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
                      <Input placeholder="/users" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe what this permission allows." {...field} />
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
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
});

EditPermissionSheet.displayName = "EditPermissionSheet";

export { EditPermissionSheet };

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { memo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useCreateRole } from "@/presentation/hooks/roles/useCreateRole";
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
import { StorageScopeEditor } from "./storage-scope-editor";

type AddRoleSheetProps = Record<string, never>;

const storageScopeSchema = z.object({
  pathPrefix: z.string(),
  capability: z.enum(["read", "manage"]),
  inheritChildren: z.boolean(),
});

const formSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters."),
  description: z.string().min(5, "Description must be at least 5 characters."),
  permissionIds: z.array(z.string()),
  storageScopes: z.array(storageScopeSchema),
});

const AddRoleSheet = memo((_props: AddRoleSheetProps) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createRole, isPending } = useCreateRole();
  const { data: allPermissions = [], isLoading: permissionsLoading } =
    usePermissions();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      permissionIds: [],
      storageScopes: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await createRole({
        name: values.name,
        description: values.description,
        permissionIds: values.permissionIds,
        storageScopes: values.storageScopes,
      });

      toast.success(response.message || "Role created successfully.");
      form.reset();
      setOpen(false);
    } catch (error: any) {
      toast.error("Could not create role", {
        description: error?.message || "The server returned an unexpected error.",
      });
    }
  };

  const togglePermission = (permissionId: string) => {
    const current = form.getValues("permissionIds");
    const next = current.includes(permissionId)
      ? current.filter((id) => id !== permissionId)
      : [...current, permissionId];

    form.setValue("permissionIds", next, { shouldDirty: true });
  };

  const selectedIds = form.watch("permissionIds");
  const storageScopes = form.watch("storageScopes");

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      form.reset();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button className="sm:self-auto">
          <Plus className="size-4" />
          Add role
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Create role</SheetTitle>
          <SheetDescription>
            Set the base permissions and storage subtree access in one step.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-full flex-col"
          >
            <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role name</FormLabel>
                    <FormControl>
                      <Input placeholder="cto" {...field} />
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
                      <Input
                        placeholder="Explain the responsibilities of this role."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <p className="text-sm font-medium leading-none">Permissions</p>
                {permissionsLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading permissions...
                  </p>
                ) : allPermissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No permissions are available yet.
                  </p>
                ) : (
                  <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border border-border/70 p-2">
                    {allPermissions.map((permission) => {
                      const checked = selectedIds.includes(permission.id);

                      return (
                        <label
                          key={permission.id}
                          className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50"
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 size-4 shrink-0 accent-primary"
                            checked={checked}
                            onChange={() => togglePermission(permission.id)}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-mono text-xs font-medium">
                              {permission.code}
                            </p>
                            {permission.description && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Selected {selectedIds.length} / {allPermissions.length}
                </p>
              </div>

              <StorageScopeEditor
                value={storageScopes}
                onChange={(nextScopes) =>
                  form.setValue("storageScopes", nextScopes, {
                    shouldDirty: true,
                  })
                }
                disabled={isPending}
                enabled={open}
              />
            </div>

            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Create role"}
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

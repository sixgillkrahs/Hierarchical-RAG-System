import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import AuthService from "../../../shared/auth/AuthService";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";

const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email là bắt buộc.")
    .email("Email không đúng định dạng."),
  password: z
    .string()
    .min(8, "Mật khẩu cần ít nhất 8 ký tự.")
    .max(128, "Mật khẩu quá dài."),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const defaultValues: SignInFormValues = {
  email: "",
  password: "",
};

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Không thể đăng nhập. Kiểm tra lại thông tin hoặc cấu hình API.";
};

const trustPoints = [
  "Form validation chạy trên React Hook Form + Zod, hiển thị lỗi ngay tại field.",
  "Luồng submit đã nối với AuthService để bạn gắn backend thật mà không phải đổi UI.",
  "Bố cục dùng shadcn-style components nên có thể tái sử dụng cho reset password và invite flow.",
];

function SignInPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const handleSubmit = async (values: SignInFormValues) => {
    setSubmitError(null);

    try {
      await AuthService.signIn(values);
      startTransition(() => {
        void navigate({ to: "/" });
      });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(176,123,55,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(75,49,23,0.16),transparent_22%)]" />
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <section className="hidden lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.36em] text-muted-foreground">
              Admin Access
            </p>
            <div className="space-y-5">
              <h1 className="max-w-xl text-6xl font-semibold tracking-tight text-balance">
                Sign in to steer the retrieval stack with precision.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                A focused entry point for operators who need clean access to
                dataset health, indexing jobs, and permission-bound tooling.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/60 bg-card/70 p-8 shadow-[0_30px_100px_-50px_rgba(72,48,22,0.6)] backdrop-blur">
            <div className="grid gap-4">
              {trustPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-3xl border border-border/60 bg-background/70 p-5"
                >
                  <p className="text-sm leading-7 text-foreground/88">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <Card className="w-full max-w-xl">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="rounded-full border border-border/70 bg-background/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Secure Sign In
                </div>
                <Link
                  to="/"
                  className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Back to portal
                </Link>
              </div>
              <div className="space-y-2">
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                  Đăng nhập bằng tài khoản quản trị để tiếp tục vào admin
                  portal.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {submitError ? (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                  {submitError}
                </div>
              ) : null}

              <Form {...form}>
                <form
                  className="space-y-5"
                  onSubmit={form.handleSubmit(handleSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="email"
                            placeholder="admin@company.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Dùng email đã được cấp quyền vào hệ thống.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <a
                            href="mailto:support@company.com"
                            className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                          >
                            Forgot password?
                          </a>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              autoComplete="current-password"
                              placeholder="Enter your password"
                              type={showPassword ? "text" : "password"}
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-3 my-auto h-8 rounded-full px-3 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
                              onClick={() => setShowPassword((value) => !value)}
                            >
                              {showPassword ? "Hide" : "Show"}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-3xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                    API target:{" "}
                    <span className="font-medium text-foreground">
                      {import.meta.env.VITE_BASEURL || "Missing VITE_BASEURL"}
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    type="submit"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting
                      ? "Signing in..."
                      : "Sign in to admin"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

export default SignInPage;

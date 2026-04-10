import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v3";
import AuthService from "../../../shared/auth/AuthService";
import {
  AUTH_SESSION_QUERY_KEY,
  setAuthSession,
} from "../../../shared/auth/auth-session";
import { getFirstAccessibleRoute } from "../../../shared/auth/route-access";
import { queryClient } from "../../../shared/query/queryClient";
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
    .min(1, "Email is required.")
    .email("Email format is invalid."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
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

  return "Unable to sign in. Check the credentials or API configuration.";
};

function SignInPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const handleSubmit = async (values: SignInFormValues) => {
    try {
      const response = await AuthService.signIn(values);
      setAuthSession(queryClient, response.user);
      await queryClient.invalidateQueries({
        queryKey: AUTH_SESSION_QUERY_KEY,
        refetchType: "none",
      });
      toast.success("Login successful", {
        description: response.message,
      });
      const destination = getFirstAccessibleRoute(response.user.routes) ?? "/";
      startTransition(() => {
        void navigate({ to: destination });
      });
    } catch (error) {
      toast.error("Login failed", {
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#f8f4ec_0%,#f2eadf_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(178,133,71,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(67,88,102,0.12),transparent_24%)]" />
      <div className="absolute top-16 left-1/2 -z-10 h-48 w-48 -translate-x-1/2 rounded-full bg-white/60 blur-3xl" />

      <Card className="w-full max-w-md border-white/70 bg-[#fffaf4]/92 shadow-[0_36px_100px_-48px_rgba(66,46,23,0.48)]">
        <CardHeader className="space-y-5 p-8 pb-0 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#dcc9ab] bg-white/85 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#7f6133]">
            <ShieldCheck className="size-3.5" />
            Admin Portal
          </div>

          <div className="space-y-3">
            <div className="mx-auto flex size-14 items-center justify-center rounded-[1.4rem] bg-[#f2e6d3] text-[#7f6133]">
              <LockKeyhole className="size-6" />
            </div>
            <CardTitle className="text-[2rem] tracking-[-0.04em] text-[#211a13]">
              Sign in
            </CardTitle>
            <CardDescription className="text-[0.96rem] leading-7 text-[#726556]">
              Use your administrative account to access the control panel.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-8">
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
                    <FormLabel className="text-sm font-semibold text-[#251d16]">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="email"
                        className="h-12 rounded-2xl border-[#dac9af] bg-white px-4 text-sm text-[#221b14] placeholder:text-[#9a8a77] focus-visible:border-[#8f6c3a] focus-visible:ring-[#8f6c3a]/20"
                        placeholder="admin@company.com"
                        {...field}
                        tabIndex={1}
                      />
                    </FormControl>
                    <FormDescription className="text-xs leading-6 text-[#877764]">
                      Account must already be granted portal access.
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
                    <div className="flex items-center justify-between gap-4">
                      <FormLabel className="text-sm font-semibold text-[#251d16]">
                        Password
                      </FormLabel>
                      <a
                        href="mailto:support@company.com"
                        className="text-sm font-medium text-[#8f6c3a] transition hover:text-[#6f532c]"
                      >
                        Need help?
                      </a>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          autoComplete="current-password"
                          className="h-12 rounded-2xl border-[#dac9af] bg-white px-4 pr-14 text-sm text-[#221b14] placeholder:text-[#9a8a77] focus-visible:border-[#8f6c3a] focus-visible:ring-[#8f6c3a]/20"
                          placeholder="Enter your password"
                          type={showPassword ? "text" : "password"}
                          {...field}
                          tabIndex={2}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-2 my-auto inline-flex size-9 items-center justify-center rounded-full text-[#7d6a54] transition hover:bg-[#f4ecdf] hover:text-[#221b14]"
                          onClick={() => setShowPassword((value) => !value)}
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                className="h-12 w-full rounded-2xl bg-[#231b14] text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(35,27,20,0.8)] transition hover:bg-[#3a2d22]"
                size="lg"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Signing in..."
                  : "Sign in to continue"}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <Link
              to="/"
              className="inline-flex text-sm font-medium text-[#7b6b5b] transition hover:text-[#241c15]"
            >
              Back to portal
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignInPage;

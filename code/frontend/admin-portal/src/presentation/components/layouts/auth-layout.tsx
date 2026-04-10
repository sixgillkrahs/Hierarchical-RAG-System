import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen">
      {children}
    </main>
  );
}

export default AuthLayout;

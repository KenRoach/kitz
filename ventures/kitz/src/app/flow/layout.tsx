import { AuthProvider } from "@/components/flow/auth-provider";

export const metadata = {
  title: "Flow — Workspace",
  description: "Your business tools workspace",
};

export default function FlowLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

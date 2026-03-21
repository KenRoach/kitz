import { FlowShell } from "@/components/flow/flow-shell";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <FlowShell>{children}</FlowShell>;
}

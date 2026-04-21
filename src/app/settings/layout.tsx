import { ReactNode } from "react";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <div style={{ maxWidth: 720, margin: "0 auto" }}>{children}</div>;
}

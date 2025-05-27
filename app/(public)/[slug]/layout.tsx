import { ClientProvider } from "./client-context";

export default function SlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientProvider>{children}</ClientProvider>;
} 
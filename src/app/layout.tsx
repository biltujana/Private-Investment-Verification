import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "PIV — Private Investment Verification | Midnight ZK dApp",
  description: "Privacy-preserving zero-knowledge accredited investor verification on Midnight Network.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
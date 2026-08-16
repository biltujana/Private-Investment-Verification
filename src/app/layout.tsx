import type { Metadata } from "next";
import "../app/globals.css";
import ClientLayout from "../app/ClientLayout";

export const metadata: Metadata = {
  title: "Private Investment Verification (PIV) | Midnight Network ZK dApp",
  description: "Privacy-preserving zero-knowledge accredited investor verification and capital commitment dApp on Midnight Network.",
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar({
  walletAddress,
  walletName,
  onConnect,
  onDisconnect,
  connecting
}: {
  walletAddress: string | null;
  walletName?: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  connecting: boolean;
}) {
  const pathname = usePathname();
  const shortAddr = walletAddress
    ? `${walletAddress.substring(0, 8)}...${walletAddress.slice(-6)}`
    : null;

  return (
    <header className="nav">
      <Link href="/" className="nav-brand">
        <span style={{ color: "#10b981", fontWeight: 800 }}>PIV</span>
        <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 400 }}>Midnight ZK</span>
      </Link>
      <div className="nav-links">
        <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>
          Dashboard
        </Link>
        <Link href="/verify" className={`nav-link ${pathname === "/verify" ? "active" : ""}`}>
          Accreditation Portal
        </Link>
        <Link href="/manager" className={`nav-link ${pathname === "/manager" ? "active" : ""}`}>
          Fund Manager Console
        </Link>
        <Link href="/explorer" className={`nav-link ${pathname === "/explorer" ? "active" : ""}`}>
          Explorer
        </Link>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {walletAddress ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {walletName && (
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "#94a3b8",
                  fontWeight: 500
                }}
              >
                {walletName}
              </span>
            )}
            <span
              style={{
                fontSize: "0.8rem",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                color: "#10b981",
                padding: "0.35rem 0.9rem",
                borderRadius: "99px",
                fontWeight: 700
              }}
            >
              {shortAddr}
            </span>
            <button
              onClick={onDisconnect}
              className="btn-secondary"
              style={{ padding: "0.35rem 0.9rem", fontSize: "0.78rem" }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={onConnect}
            className="btn-primary"
            style={{ padding: "0.35rem 1.1rem", fontSize: "0.8rem" }}
            disabled={connecting}
          >
            {connecting ? "Connecting..." : "Connect 1am Wallet"}
          </button>
        )}
      </div>
    </header>
  );
}
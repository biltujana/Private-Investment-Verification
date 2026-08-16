"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar({
  walletAddress,
  onConnect,
  onDisconnect,
  connecting
}: {
  walletAddress: string | null;
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
        <span>💎</span> PIV — Midnight ZK
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
            <span
              style={{
                fontSize: "0.8rem",
                background: "rgba(59, 130, 246, 0.15)",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                color: "#60a5fa",
                padding: "0.35rem 0.9rem",
                borderRadius: "99px",
                fontWeight: 700
              }}
            >
              🟢 {shortAddr}
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
            id="connect-wallet-btn"
            onClick={onConnect}
            disabled={connecting}
            className="btn-primary"
            style={{ padding: "0.45rem 1.1rem", fontSize: "0.82rem" }}
          >
            {connecting ? (
              <>
                <span className="spinner" /> Connecting...
              </>
            ) : (
              <>👛 Connect Wallet</>
            )}
          </button>
        )}
      </div>
    </header>
  );
}

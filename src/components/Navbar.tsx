"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar({
  walletAddress,
  walletName,
  onConnect,
  onDisconnect,
  connecting,
}: {
  walletAddress: string | null;
  walletName?: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  connecting: boolean;
}) {
  const pathname = usePathname();

  const addrStr = walletAddress
    ? typeof walletAddress === "string"
      ? walletAddress
      : JSON.stringify(walletAddress)
    : null;

  const shortAddr = addrStr && addrStr.length >= 6
    ? `${addrStr.substring(0, 6)}...${addrStr.slice(-4)}`
    : addrStr || null;

  const links = [
    { href: "/",        label: "Dashboard" },
    { href: "/verify",  label: "Accreditation" },
    { href: "/manager", label: "Fund Manager" },
    { href: "/explorer",label: "Explorer" },
  ];

  return (
    <header className="nav">
      {/* Brand */}
      <Link href="/" className="nav-brand">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
          <rect width="22" height="22" rx="5" fill="#0A0A0A"/>
          <path d="M6 11 L11 6 L16 11 L11 16 Z" fill="white"/>
        </svg>
        PIV<span className="dot">.</span>
      </Link>

      {/* Nav links */}
      <nav className="nav-links">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link${pathname === href ? " active" : ""}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Wallet */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {addrStr ? (
          <>
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: "var(--bg-alt)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)", padding: "0.3rem 0.75rem",
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#0A0A0A", display: "inline-block",
              }} />
              <span style={{ fontSize: "0.78rem", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                {shortAddr}
              </span>
              {walletName && (
                <span style={{ fontSize: "0.72rem", color: "var(--fg-3)" }}>· {walletName}</span>
              )}
            </div>
            <button onClick={onDisconnect} className="btn-outline" style={{ padding: "0.3rem 0.8rem", fontSize: "0.78rem" }}>
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={onConnect}
            className="btn-primary"
            style={{ padding: "0.42rem 1.1rem", fontSize: "0.83rem" }}
            disabled={connecting}
          >
            {connecting ? "Connecting..." : "Connect 1am Wallet"}
          </button>
        )}
      </div>
    </header>
  );
}
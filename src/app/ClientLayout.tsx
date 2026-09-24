"use client";

import { useState, useCallback, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getClient, type PrivateInvestmentVerificationClient } from "../lib/contract";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Always start null on server and first client render to avoid hydration mismatch
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only read sessionStorage AFTER hydration is complete (client-only)
  useEffect(() => {
    setMounted(true);
    try {
      const ok = sessionStorage.getItem("piv_wallet_connected") === "true";
      const addr = sessionStorage.getItem("piv_wallet_address");
      const name = sessionStorage.getItem("piv_wallet_name");
      if (ok && addr) {
        setWalletAddress(addr);
        setWalletName(name || "1am Wallet");
      }
    } catch {
      // sessionStorage not available (private browsing, SSR, etc.)
    }
  }, []);

  const handleConnect = useCallback(async () => {
    setConnecting(true);
    try {
      const client: PrivateInvestmentVerificationClient = getClient();
      // Try 1am wallet first (preferred), then fall back to any available Midnight wallet
      const res = await client.connectWallet("1am");
      setWalletAddress(res.address);
      const name = res.walletName || "1am Wallet";
      setWalletName(name);
      try {
        sessionStorage.setItem("piv_wallet_connected", "true");
        sessionStorage.setItem("piv_wallet_address", res.address);
        sessionStorage.setItem("piv_wallet_name", name);
      } catch {}
    } catch (err: any) {
      alert(err?.message || "Wallet connection failed. Please install the 1am wallet from https://1am.xyz");
    } finally {
      setConnecting(false);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    try {
      const client: PrivateInvestmentVerificationClient = getClient();
      client.disconnectWallet();
    } catch {}
    setWalletAddress(null);
    setWalletName(null);
    try {
      sessionStorage.removeItem("piv_wallet_connected");
      sessionStorage.removeItem("piv_wallet_address");
      sessionStorage.removeItem("piv_wallet_name");
    } catch {}
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar
        walletAddress={mounted ? walletAddress : null}
        walletName={mounted ? walletName : null}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        connecting={connecting}
      />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
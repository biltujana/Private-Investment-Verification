"use client";

import { useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import { getClient, type PrivateInvestmentVerificationClient } from "../lib/contract";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const ok = sessionStorage.getItem("piv_wallet_connected") === "true";
    const addr = sessionStorage.getItem("piv_wallet_address");
    return ok && addr ? addr : null;
  });
  const [walletName, setWalletName] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = useCallback(async () => {
    setConnecting(true);
    try {
      const client: PrivateInvestmentVerificationClient = getClient();
      // Try 1am wallet first (preferred), then fall back to any available Midnight wallet
      const res = await client.connectWallet("1am");
      setWalletAddress(res.address);
      setWalletName(res.walletName || "1am Wallet");
    } catch (err: any) {
      alert(err?.message || "Wallet connection failed. Please install the 1am wallet from https://1am.xyz");
    } finally {
      setConnecting(false);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    const client: PrivateInvestmentVerificationClient = getClient();
    client.disconnectWallet();
    setWalletAddress(null);
    setWalletName(null);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar
        walletAddress={walletAddress}
        walletName={walletName}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        connecting={connecting}
      />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
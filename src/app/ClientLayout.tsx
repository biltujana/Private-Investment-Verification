"use client";

import { useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import { getClient, type PrivateInvestmentVerificationClient } from "../lib/contract";
import type { DAppConnectorAPI, ConnectedAPI, InitialAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { MidnightProviders } from "@midnight-ntwrk/midnight-js-types";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const ok = sessionStorage.getItem("piv_wallet_connected") === "true";
    const addr = sessionStorage.getItem("piv_wallet_address");
    return ok && addr ? addr : null;
  });
  const [connecting, setConnecting] = useState(false);

  const handleConnect = useCallback(async () => {
    setConnecting(true);
    try {
      const client: PrivateInvestmentVerificationClient = getClient();
      const res = await client.connectWallet();
      setWalletAddress(res.walletAddress);
    } catch (err: any) {
      alert(err?.message || "Wallet connection failed.");
    } finally {
      setConnecting(false);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    const client: PrivateInvestmentVerificationClient = getClient();
    client.disconnectWallet();
    setWalletAddress(null);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar
        walletAddress={walletAddress}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        connecting={connecting}
      />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}

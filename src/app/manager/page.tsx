"use client";

import { useState } from "react";
import { getClient, NETWORK_CONFIG, type PrivateInvestmentVerificationClient } from "../../lib/contract";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { MidnightProviders } from "@midnight-ntwrk/midnight-js-types";
import Link from "next/link";

export default function ManagerPage() {
  const [managerKey, setManagerKey] = useState("");
  const [minThreshold, setMinThreshold] = useState(2500000);
  const [loadingManager, setLoadingManager] = useState(false);

  const [revokeCommitment, setRevokeCommitment] = useState("");
  const [loadingRevoke, setLoadingRevoke] = useState(false);

  const [newFundId, setNewFundId] = useState("fund_andreessen_crypto_v");
  const [resetMinThreshold, setResetMinThreshold] = useState(2500000);
  const [loadingReset, setLoadingReset] = useState(false);

  const [loadingSession, setLoadingSession] = useState(false);

  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<{ msg: string; type: string }[]>([]);

  const addLog = (msg: string, type = "info") => setLogs(l => [...l, { msg, type }]);
  const isLoading = loadingManager || loadingRevoke || loadingReset || loadingSession;

  const handleSetManagerCommitment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingManager(true);
    setLogs([]);
    setResult(null);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet via @midnight-ntwrk/dapp-connector-api...", "info");
      addLog("> [ZK WITNESS] fundManagerSigningKey() - authorized fund general partner key loaded", "info");
      addLog(`> [CIRCUIT CALL] Executing setFundManagerCommitment(Uint<32>) - threshold=$${minThreshold.toLocaleString()}...`, "info");

      const client: PrivateInvestmentVerificationClient = getClient();
      client.setManagerKey(managerKey || "manager_default_private_key");
      const res = await client.setFundManagerCommitment(minThreshold);

      setResult({ ...res, circuit: "setFundManagerCommitment(Uint<32>)" });
      addLog(`> [SUCCESS] Fund Manager Authority anchored on Midnight Preview!`, "success");
      addLog(`> [COMMITMENT] ${res.fundManagerCommitment}`, "success");
      addLog(`> [MIN THRESHOLD] $${res.newMinimumThreshold.toLocaleString()} USD`, "success");
      addLog(`> [TX HASH] ${res.txHash}`, "success");
    } catch (err: any) {
      addLog(`> [ERROR] ${err?.message || err}`, "error");
    } finally {
      setLoadingManager(false);
    }
  };

  const handleRevokeInvestor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingRevoke(true);
    setLogs([]);
    setResult(null);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet session...", "info");
      addLog("> [ZK WITNESS] fundManagerSigningKey() - generating ZK governance authorization proof", "info");
      addLog(`> [CIRCUIT CALL] Executing revokeInvestorAccreditation(Bytes<32>) on-chain...`, "info");

      const client: PrivateInvestmentVerificationClient = getClient();
      client.setManagerKey(managerKey || "manager_default_private_key");
      const res = await client.revokeInvestorAccreditation(revokeCommitment);

      setResult({ ...res, circuit: "revokeInvestorAccreditation(Bytes<32>)" });
      addLog(`> [SUCCESS] Investor accreditation revoked on-chain!`, "success");
      addLog(`> [REVOKED COMMITMENT] ${res.revokedCommitment}`, "success");
      addLog(`> [TX HASH] ${res.txHash}`, "success");
    } catch (err: any) {
      addLog(`> [ERROR] ${err?.message || err}`, "error");
    } finally {
      setLoadingRevoke(false);
    }
  };

  const handleResetFund = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingReset(true);
    setLogs([]);
    setResult(null);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet session...", "info");
      addLog(`> [CIRCUIT CALL] Executing resetInvestmentFund("${newFundId}", ${resetMinThreshold})...`, "info");

      const client: PrivateInvestmentVerificationClient = getClient();
      const res = await client.resetInvestmentFund(newFundId, resetMinThreshold);

      setResult({ ...res, circuit: "resetInvestmentFund(Bytes<32>, Uint<32>)" });
      addLog(`> [SUCCESS] Investment Fund Offering ID updated on-chain!`, "success");
      addLog(`> [NEW FUND ID] ${res.newFundId}`, "success");
      addLog(`> [TX HASH] ${res.txHash}`, "success");
    } catch (err: any) {
      addLog(`> [ERROR] ${err?.message || err}`, "error");
    } finally {
      setLoadingReset(false);
    }
  };

  const handleIncrementSession = async () => {
    setLoadingSession(true);
    setLogs([]);
    setResult(null);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet session...", "info");
      addLog("> [CIRCUIT CALL] Executing incrementSession() - rotating active grant epoch...", "info");

      const client: PrivateInvestmentVerificationClient = getClient();
      const res = await client.incrementSession();

      setResult({ ...res, circuit: "incrementSession()" });
      addLog(`> [SUCCESS] Active session epoch incremented (+1)! TxHash: ${res.txHash}`, "success");
    } catch (err: any) {
      addLog(`> [ERROR] ${err?.message || err}`, "error");
    } finally {
      setLoadingSession(false);
    }
  };

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
          <span className="badge badge-indigo">Fund Manager Console</span>
          <span className="badge badge-cyan">Authority Controls (Midnight.js)</span>
          <span className="badge badge-gold">Midnight Preview</span>
        </div>
        <h1 className="section-title">Fund Manager Governance</h1>
        <p className="section-desc">
          Fund manager circuits require the General Partner''s private signing key as a ZK witness. The private key is never revealed on-chain — only derived cryptographic authority commitments are verified.
        </p>
      </div>

      {/* ── Panel 1: Set Manager Commitment ── */}
      <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.5rem", borderLeft: "3px solid #6366f1" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            🔑 Panel 1 — setFundManagerCommitment
          </div>
          <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#a5b4fc", background: "rgba(99, 102, 241, 0.1)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
            circuit: setFundManagerCommitment(Uint&lt;32&gt;)
          </span>
        </div>
        <p style={{ fontSize: "0.83rem", color: "#94a3b8", marginBottom: "1rem" }}>
          Anchors the General Partner authority public commitment on-chain and configures the minimum required net worth threshold for LP onboarding.
        </p>
        <form onSubmit={handleSetManagerCommitment} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.4rem" }}>
              Fund Manager Private Signing Key (ZK Witness — fundManagerSigningKey())
            </label>
            <input
              type="password"
              id="managerKey"
              value={managerKey}
              onChange={e => setManagerKey(e.target.value)}
              placeholder="Fund manager private signing key (never transmitted)"
              autoComplete="off"
            />
          </div>
          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.4rem" }}>
              Minimum Required Net Worth: <span style={{ color: "#10b981", fontWeight: 700 }}>${minThreshold.toLocaleString()} USD</span>
            </label>
            <input
              type="range"
              min={1000000}
              max={10000000}
              step={250000}
              value={minThreshold}
              onChange={e => setMinThreshold(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#6366f1" }}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            id="setManagerBtn"
          >
            {loadingManager ? <><span className="spinner" /> Executing Circuit...</> : "Anchor Fund Authority (Circuit Call)"}
          </button>
        </form>
      </div>

      {/* ── Panel 2: Revoke Investor ── */}
      <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.5rem", borderLeft: "3px solid #f43f5e" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f43f5e", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            🚩 Panel 2 — revokeInvestorAccreditation
          </div>
          <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#fda4af", background: "rgba(244, 63, 94, 0.1)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
            circuit: revokeInvestorAccreditation(Bytes&lt;32&gt;)
          </span>
        </div>
        <p style={{ fontSize: "0.83rem", color: "#94a3b8", marginBottom: "1rem" }}>
          Disqualify non-compliant or sanctioned investors. Requires fund manager authority proof via <code>fundManagerSigningKey()</code> witness.
        </p>
        <form onSubmit={handleRevokeInvestor} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.4rem" }}>
              Investor Commitment Hash to Revoke (Bytes&lt;32&gt;)
            </label>
            <input
              type="text"
              id="revokeCommitment"
              value={revokeCommitment}
              onChange={e => setRevokeCommitment(e.target.value)}
              placeholder="0x... investor commitment hash to revoke"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || !revokeCommitment}
            id="revokeInvestorBtn"
            style={{ background: "rgba(244, 63, 94, 0.15)", borderColor: "rgba(244, 63, 94, 0.4)" }}
          >
            {loadingRevoke ? <><span className="spinner" /> Executing Circuit...</> : "Revoke Accreditation (Circuit Call)"}
          </button>
        </form>
      </div>

      {/* ── Panel 3: Reset Fund Offering ── */}
      <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.5rem", borderLeft: "3px solid #06b6d4" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            🔄 Panel 3 — resetInvestmentFund
          </div>
          <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#67e8f9", background: "rgba(6, 182, 212, 0.1)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
            circuit: resetInvestmentFund(Bytes&lt;32&gt;, Uint&lt;32&gt;)
          </span>
        </div>
        <p style={{ fontSize: "0.83rem", color: "#94a3b8", marginBottom: "1rem" }}>
          Rotate active investment fund offering ID and reset minimum accreditation criteria for new fund vintages.
        </p>
        <form onSubmit={handleResetFund} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.4rem" }}>
              New Fund Offering Identifier (Bytes&lt;32&gt;)
            </label>
            <input
              type="text"
              id="newFundId"
              value={newFundId}
              onChange={e => setNewFundId(e.target.value)}
              placeholder="fund_andreessen_crypto_v"
              required
            />
          </div>
          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.4rem" }}>
              New Minimum Net Worth: <span style={{ color: "#10b981", fontWeight: 700 }}>${resetMinThreshold.toLocaleString()} USD</span>
            </label>
            <input
              type="range"
              min={1000000}
              max={10000000}
              step={250000}
              value={resetMinThreshold}
              onChange={e => setResetMinThreshold(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#06b6d4" }}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            id="resetFundBtn"
            style={{ background: "rgba(6, 182, 212, 0.15)", borderColor: "rgba(6, 182, 212, 0.4)" }}
          >
            {loadingReset ? <><span className="spinner" /> Executing Circuit...</> : "Rotate Fund Offering ID (Circuit Call)"}
          </button>
        </form>
      </div>

      {/* ── Panel 4: Increment Session ── */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem", borderLeft: "3px solid #eab308" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#eab308", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            🔒 Panel 4 — incrementSession
          </div>
          <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#fde047", background: "rgba(234, 179, 8, 0.1)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
            circuit: incrementSession()
          </span>
        </div>
        <p style={{ fontSize: "0.83rem", color: "#94a3b8", marginBottom: "1rem" }}>
          Bumps the <code>activeSession</code> nonce to invalidate stale proofs from previous epochs and protect against replay attacks.
        </p>
        <button
          onClick={handleIncrementSession}
          className="btn-secondary"
          disabled={isLoading}
          id="incrementSessionBtn"
        >
          {loadingSession ? <><span className="spinner" /> Bumping Session Nonce...</> : "Increment Session Nonce (+1)"}
        </button>
      </div>

      {/* ── Activity Logs ── */}
      {logs.length > 0 && (
        <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Smart Contract Execution Log
          </div>
          <div className="log-box">
            {logs.map((l, i) => (
              <div key={i} className={`log-${l.type}`}>{l.msg}</div>
            ))}
          </div>
        </div>
      )}

      {/* ── Result Card ── */}
      {result && (
        <div className="glass-card fade-in" style={{ padding: "1.5rem", border: "1px solid rgba(16, 185, 129, 0.4)", background: "rgba(16, 185, 129, 0.04)" }}>
          <div style={{ color: "#10b981", fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>
            ✅ Transaction Confirmed on Midnight Preview
          </div>
          {Object.entries(result).map(([k, v]) => v !== undefined && (
            <div key={k} style={{ display: "flex", gap: "1rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.78rem", color: "#64748b", minWidth: 170 }}>{k}:</span>
              <span style={{ fontSize: "0.78rem", color: "#f8fafc", fontFamily: "monospace", wordBreak: "break-all" }}>{String(v)}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
            <Link href="/" className="btn-secondary">Back to Dashboard</Link>
            <Link href="/explorer" className="btn-secondary">View on Chain Explorer</Link>
          </div>
        </div>
      )}
    </div>
  );
}

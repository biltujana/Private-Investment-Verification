"use client";

import { useState } from "react";
import { getClient } from "../../lib/contract";
import Link from "next/link";

export default function ManagerPage() {
  const [managerKey, setManagerKey] = useState("");
  const [minThreshold, setMinThreshold] = useState(1000000);
  const [loadingManager, setLoadingManager] = useState(false);

  const [revokeCommitment, setRevokeCommitment] = useState("");
  const [loadingRevoke, setLoadingRevoke] = useState(false);

  const [newFundId, setNewFundId] = useState("fund_andreessen_crypto_v");
  const [resetMinThreshold, setResetMinThreshold] = useState(1000000);
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
      addLog("> [WALLET] Connecting to Midnight Lace Wallet session...", "info");
      addLog("> [ZK WITNESS] fundManagerSigningKey() — authorized fund manager secret key loaded", "info");
      addLog(`> [CIRCUIT] Executing setFundManagerCommitment(Uint<32>) — minimumThreshold=$${minThreshold.toLocaleString()}...`, "info");

      const client = getClient();
      client.setManagerKey(managerKey || "manager_default_private_key");
      const res = await client.setFundManagerCommitment(minThreshold);

      setResult({ ...res, circuit: "setFundManagerCommitment(Uint<32>)" });
      addLog(`> [SUCCESS] Fund Manager authority anchored on-chain!`, "success");
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
      addLog("> [ZK WITNESS] fundManagerSigningKey() — generating ZK management authorization proof", "info");
      addLog(`> [CIRCUIT] Executing revokeInvestorAccreditation(Bytes<32>) for commitment...`, "info");

      const client = getClient();
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
      addLog(`> [CIRCUIT] Executing resetInvestmentFund("${newFundId}", ${resetMinThreshold})...`, "info");

      const client = getClient();
      const res = await client.resetInvestmentFund(newFundId, resetMinThreshold);

      setResult({ ...res, circuit: "resetInvestmentFund(Bytes<32>, Uint<32>)" });
      addLog(`> [SUCCESS] Investment Fund Offering ID updated on-chain!`, "success");
      addLog(`> [NEW ID] ${res.newFundId}`, "success");
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
      addLog("> [CIRCUIT] Executing incrementSession() — rotating active deal round epoch...", "info");

      const client = getClient();
      const res = await client.incrementSession();

      setResult({ ...res, circuit: "incrementSession()" });
      addLog(`> [SUCCESS] Active session epoch incremented! TxHash: ${res.txHash}`, "success");
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
          <span className="badge badge-sapphire">Fund Manager Console</span>
          <span className="badge badge-cyan">Authority Controls</span>
          <span className="badge badge-gold">Midnight Preview</span>
        </div>
        <h1 className="section-title">Fund Manager Admin Console</h1>
        <p className="section-desc">
          Fund manager circuits require the general partner''s private signing key as a ZK witness. The private key is never revealed on-chain — only derived cryptographic commitments are verified.
        </p>
      </div>

      {/* ── Panel 1: Set Fund Manager Commitment ── */}
      <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.5rem", borderLeft: "3px solid #3b82f6" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#3b82f6", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          🔑 Panel 1 — setFundManagerCommitment(Uint&lt;32&gt;)
        </div>
        <p style={{ fontSize: "0.83rem", color: "#94a3b8", marginBottom: "1rem" }}>
          Anchors the fund manager authority public commitment on-chain and configures the minimum required net worth threshold.
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
              Minimum Accreditation Net Worth: <span style={{ color: "#3b82f6", fontWeight: 700 }}>${minThreshold.toLocaleString()} USD</span>
            </label>
            <input
              type="range"
              min={500000}
              max={10000000}
              step={250000}
              value={minThreshold}
              onChange={e => setMinThreshold(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#3b82f6" }}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            id="setManagerBtn"
          >
            {loadingManager ? <><span className="spinner" /> Anchoring Authority...</> : "Anchor Fund Authority (ZK)"}
          </button>
        </form>
      </div>

      {/* ── Panel 2: Revoke Investor ── */}
      <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.5rem", borderLeft: "3px solid #f43f5e" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f43f5e", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          🚫 Panel 2 — revokeInvestorAccreditation(Bytes&lt;32&gt;)
        </div>
        <p style={{ fontSize: "0.83rem", color: "#94a3b8", marginBottom: "1rem" }}>
          Revoke or invalidate a disqualified investor accreditation commitment. Requires fund manager authority proof via <code>fundManagerSigningKey()</code> witness.
        </p>
        <form onSubmit={handleRevokeInvestor} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.4rem" }}>
              Accreditation Commitment Hash to Revoke (Bytes&lt;32&gt;)
            </label>
            <input
              type="text"
              id="revokeCommitment"
              value={revokeCommitment}
              onChange={e => setRevokeCommitment(e.target.value)}
              placeholder="0x... accreditation commitment hash to revoke"
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
            {loadingRevoke ? <><span className="spinner" /> Revoking on Midnight...</> : "Revoke Accreditation (ZK Auth)"}
          </button>
        </form>
      </div>

      {/* ── Panel 3: Reset Fund Offering ── */}
      <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.5rem", borderLeft: "3px solid #06b6d4" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#06b6d4", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          🔄 Panel 3 — resetInvestmentFund(Bytes&lt;32&gt;, Uint&lt;32&gt;)
        </div>
        <p style={{ fontSize: "0.83rem", color: "#94a3b8", marginBottom: "1rem" }}>
          Rotate active investment fund offering ID and update accreditation thresholds for new fund vehicles or deal tranches.
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
              New Minimum Threshold: <span style={{ color: "#06b6d4", fontWeight: 700 }}>${resetMinThreshold.toLocaleString()} USD</span>
            </label>
            <input
              type="range"
              min={500000}
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
            {loadingReset ? <><span className="spinner" /> Updating Offering...</> : "Rotate Fund Offering ID"}
          </button>
        </form>
      </div>

      {/* ── Panel 4: Increment Session ── */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem", borderLeft: "3px solid #eab308" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#eab308", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          🔒 Panel 4 — incrementSession()
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
          {loadingSession ? <><span className="spinner" /> Bumping Session Nonce...</> : "Increment Session Nonce"}
        </button>
      </div>

      {/* ── Activity Logs ── */}
      {logs.length > 0 && (
        <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Activity Log
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
        <div className="glass-card fade-in" style={{ padding: "1.5rem", border: "1px solid rgba(59, 130, 246, 0.4)", background: "rgba(59, 130, 246, 0.04)" }}>
          <div style={{ color: "#3b82f6", fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>
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

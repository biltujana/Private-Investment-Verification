"use client";

import { useState } from "react";
import { getClient, NETWORK_CONFIG, generateSecureEntropy, type PrivateInvestmentVerificationClient } from "../../lib/contract";
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

  const handleGenerateManagerKey = () => {
    const key = generateSecureEntropy();
    setManagerKey(key);
    addLog(`> [ENTROPY] Generated secure 256-bit Fund Manager signing key: ${key.slice(0, 16)}...`, "info");
  };

  const handleSetManagerCommitment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingManager(true);
    setLogs([]);
    setResult(null);
    try {
      addLog("> [WALLET] Connecting to 1am Wallet via @midnight-ntwrk/dapp-connector-api...", "info");
      addLog("> [ZK WITNESS] fundManagerSigningKey() - authorized fund general partner key loaded", "info");
      addLog(`> [CIRCUIT CALL] Executing callTx.setFundManagerCommitment(Uint<32>) - threshold=$${minThreshold.toLocaleString()}...`, "info");

      const client: PrivateInvestmentVerificationClient = getClient();
      const activeKey = managerKey.trim() || client.getOrGenerateManagerKey();
      client.setManagerKey(activeKey);

      const res = await client.callTx.setFundManagerCommitment(minThreshold);

      setResult({ ...res, circuit: "setFundManagerCommitment(Uint<32>)" });
      addLog("> [SUCCESS] Fund Manager Authority anchored on Midnight Preview!", "success");
      addLog(`> [COMMITMENT] ${res.fundManagerCommitment}`, "success");
      addLog(`> [MIN THRESHOLD] $${res.newMinimumThreshold?.toLocaleString()} USD`, "success");
      addLog(`> [SESSION] Advanced to epoch session #${res.sessionNumber}`, "success");
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
      addLog("> [CIRCUIT CALL] Executing callTx.revokeInvestorAccreditation(Bytes<32>)...", "info");
      const client = getClient();
      const activeKey = managerKey.trim() || client.getOrGenerateManagerKey();
      client.setManagerKey(activeKey);

      const res = await client.callTx.revokeInvestorAccreditation(revokeCommitment);

      setResult({ ...res, circuit: "revokeInvestorAccreditation(Bytes<32>)" });
      addLog("> [REVOKED] Investor commitment successfully marked as disqualified on-chain.", "success");
      addLog(`> [REVOKED COMMITMENT] ${res.revokedCommitment}`, "success");
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
      addLog(`> [CIRCUIT CALL] Executing callTx.resetInvestmentFund(${newFundId}, ${resetMinThreshold})...`, "info");
      const client = getClient();
      const activeKey = managerKey.trim() || client.getOrGenerateManagerKey();
      client.setManagerKey(activeKey);

      const res = await client.callTx.resetInvestmentFund(newFundId, resetMinThreshold);

      setResult({ ...res, circuit: "resetInvestmentFund(Bytes<32>, Uint<32>)" });
      addLog("> [SUCCESS] Fund Offering rotated and session advanced successfully.", "success");
      addLog(`> [NEW FUND ID] ${res.newFundId}`, "success");
      addLog(`> [SESSION] Epoch session #${res.sessionNumber}`, "success");
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
      addLog("> [CIRCUIT CALL] Executing callTx.incrementSession()...", "info");
      const client = getClient();
      const res = await client.callTx.incrementSession();

      setResult({ ...res, circuit: "incrementSession()" });
      addLog(`> [SUCCESS] Epoch session advanced to #${res.sessionNumber}. Previous nullifiers retired.`, "success");
    } catch (err: any) {
      addLog(`> [ERROR] ${err?.message || err}`, "error");
    } finally {
      setLoadingSession(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-indigo">General Partner Authority</span>
          <span className="badge badge-emerald">Circuits 3, 4, 5, 6</span>
          <span className="badge badge-cyan">Manager Authorization Protected</span>
        </div>
        <h1 className="section-title">Fund Manager Governance Console</h1>
        <p className="section-desc">
          Anchor General Partner management authority, rotate fund offerings, disqualify compromised commitments, and advance epoch sessions on the Midnight Network.
        </p>
      </div>

      {/* Module 1: Manager Authority & Threshold */}
      <div className="glass-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", color: "#f8fafc" }}>
          Module 1: Anchor Manager Authority & Accreditation Policy (Circuit 4)
        </h2>
        <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "1.25rem" }}>
          Derives the fund manager authority commitment on-chain. Protected: subsequent changes require proof of the existing manager signing key.
        </p>

        <form onSubmit={handleSetManagerCommitment}>
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1" }}>
                Fund Manager Private Signing Key (ZK Witness)
              </label>
              <button
                type="button"
                onClick={handleGenerateManagerKey}
                style={{ background: "rgba(99, 102, 241, 0.15)", border: "1px solid rgba(99, 102, 241, 0.4)", color: "#818cf8", borderRadius: "6px", fontSize: "0.75rem", padding: "0.2rem 0.6rem", cursor: "pointer" }}
              >
                + Generate Key
              </button>
            </div>
            <input
              type="password"
              className="input-field"
              value={managerKey}
              onChange={e => setManagerKey(e.target.value)}
              placeholder="Enter fund manager signing key or generate entropy"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "0.5rem" }}>
              Minimum Accreditation Net Worth: <strong style={{ color: "#06b6d4" }}>${minThreshold.toLocaleString()} USD</strong>
            </label>
            <input
              type="number"
              className="input-field"
              value={minThreshold}
              onChange={e => setMinThreshold(Number(e.target.value))}
              min={100000}
              step={100000}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={isLoading}>
            {loadingManager ? "Anchoring Authority on Midnight..." : "Anchor Fund Manager Authority"}
          </button>
        </form>
      </div>

      {/* Module 2: Disqualify / Revoke Accreditation */}
      <div className="glass-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", color: "#f8fafc" }}>
          Module 2: Revoke Investor Accreditation (Circuit 3)
        </h2>
        <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "1.25rem" }}>
          Disqualify an investor commitment upon compliance audit failure. Requires General Partner signing authority.
        </p>

        <form onSubmit={handleRevokeInvestor}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "0.5rem" }}>
              Investor Commitment Hash to Disqualify
            </label>
            <input
              type="text"
              className="input-field"
              value={revokeCommitment}
              onChange={e => setRevokeCommitment(e.target.value)}
              placeholder="0x..."
              required
            />
          </div>

          <button type="submit" className="btn-secondary" style={{ width: "100%", justifyContent: "center", borderColor: "rgba(244, 63, 94, 0.4)", color: "#f43f5e" }} disabled={isLoading}>
            {loadingRevoke ? "Revoking Commitment..." : "Revoke & Disqualify Investor Claim"}
          </button>
        </form>
      </div>

      {/* Module 3: Rotate Fund & Advance Epoch */}
      <div className="glass-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", color: "#f8fafc" }}>
          Module 3: Fund Offering Rotation & Session Control (Circuits 5 & 6)
        </h2>

        <form onSubmit={handleResetFund} style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "0.5rem" }}>
                New Fund Identifier
              </label>
              <input
                type="text"
                className="input-field"
                value={newFundId}
                onChange={e => setNewFundId(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "0.5rem" }}>
                Updated Threshold ($ USD)
              </label>
              <input
                type="number"
                className="input-field"
                value={resetMinThreshold}
                onChange={e => setResetMinThreshold(Number(e.target.value))}
                min={100000}
                step={100000}
              />
            </div>
          </div>

          <button type="submit" className="btn-secondary" style={{ width: "100%", justifyContent: "center" }} disabled={isLoading}>
            {loadingReset ? "Updating Fund Lineage..." : "Rotate Fund Offering (Protected)"}
          </button>
        </form>

        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.07)", paddingTop: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f8fafc" }}>Advance Epoch Session Nonce</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Rotates session counter to invalidate stale nullifiers for next funding cycle.</div>
          </div>
          <button
            type="button"
            onClick={handleIncrementSession}
            className="btn-primary"
            style={{ fontSize: "0.85rem", padding: "0.5rem 1.25rem" }}
            disabled={isLoading}
          >
            {loadingSession ? "Advancing..." : "Advance Session Nonce"}
          </button>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="terminal-box" style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>
            Governance Execution Log
          </div>
          {logs.map((l, i) => (
            <div key={i} style={{ color: l.type === "error" ? "#f43f5e" : l.type === "success" ? "#10b981" : "#94a3b8", marginBottom: "0.25rem" }}>
              {l.msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

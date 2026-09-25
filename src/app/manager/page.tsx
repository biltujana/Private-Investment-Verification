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
    addLog(`> [ENTROPY] 256-bit GP signing key: ${key.slice(0, 16)}...`, "info");
  };

  const handleSetManagerCommitment = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingManager(true); setLogs([]); setResult(null);
    try {
      addLog("> [WALLET] Connecting to 1am Wallet...", "info");
      addLog("> [ZK WITNESS] fundManagerSigningKey() — GP key loaded", "info");
      addLog(`> [CIRCUIT] callTx.setFundManagerCommitment(Uint<32>) threshold=$${minThreshold.toLocaleString()}`, "info");
      const client: PrivateInvestmentVerificationClient = getClient();
      const activeKey = managerKey.trim() || client.getOrGenerateManagerKey();
      client.setManagerKey(activeKey);
      const res = await client.callTx.setFundManagerCommitment(minThreshold);
      setResult({ ...res, circuit: "setFundManagerCommitment(Uint<32>)" });
      addLog("> [SUCCESS] Fund Manager Authority anchored on Midnight Preview!", "success");
      addLog(`> [COMMITMENT] ${res.fundManagerCommitment}`, "success");
      addLog(`> [THRESHOLD] $${res.newMinimumThreshold?.toLocaleString()} USD`, "success");
      addLog(`> [SESSION] Epoch #${res.sessionNumber}`, "success");
    } catch (err: any) { addLog(`> [ERROR] ${err?.message || err}`, "error"); }
    finally { setLoadingManager(false); }
  };

  const handleRevokeInvestor = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingRevoke(true); setLogs([]); setResult(null);
    try {
      addLog("> [CIRCUIT] callTx.revokeInvestorAccreditation(Bytes<32>)...", "info");
      const client = getClient();
      const activeKey = managerKey.trim() || client.getOrGenerateManagerKey();
      client.setManagerKey(activeKey);
      const res = await client.callTx.revokeInvestorAccreditation(revokeCommitment);
      setResult({ ...res, circuit: "revokeInvestorAccreditation(Bytes<32>)" });
      addLog("> [REVOKED] Investor commitment marked disqualified on-chain.", "success");
      addLog(`> [COMMITMENT] ${res.revokedCommitment}`, "success");
    } catch (err: any) { addLog(`> [ERROR] ${err?.message || err}`, "error"); }
    finally { setLoadingRevoke(false); }
  };

  const handleResetFund = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingReset(true); setLogs([]); setResult(null);
    try {
      addLog(`> [CIRCUIT] callTx.resetInvestmentFund(${newFundId}, ${resetMinThreshold})...`, "info");
      const client = getClient();
      const activeKey = managerKey.trim() || client.getOrGenerateManagerKey();
      client.setManagerKey(activeKey);
      const res = await client.callTx.resetInvestmentFund(newFundId, resetMinThreshold);
      setResult({ ...res, circuit: "resetInvestmentFund(Bytes<32>, Uint<32>)" });
      addLog("> [SUCCESS] Fund Offering rotated and session advanced.", "success");
      addLog(`> [NEW FUND ID] ${res.newFundId}`, "success");
    } catch (err: any) { addLog(`> [ERROR] ${err?.message || err}`, "error"); }
    finally { setLoadingReset(false); }
  };

  const handleIncrementSession = async () => {
    setLoadingSession(true); setLogs([]); setResult(null);
    try {
      addLog("> [CIRCUIT] callTx.incrementSession()...", "info");
      const client = getClient();
      const res = await client.callTx.incrementSession();
      setResult({ ...res, circuit: "incrementSession()" });
      addLog("> [SUCCESS] Session epoch advanced.", "success");
      addLog(`> [SESSION] Now at epoch #${res.sessionNumber}`, "success");
    } catch (err: any) { addLog(`> [ERROR] ${err?.message || err}`, "error"); }
    finally { setLoadingSession(false); }
  };

  const F: React.CSSProperties = { marginBottom: "1.1rem" };

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "3rem 5rem 2rem", borderBottom: "1px solid var(--border)" }}>
        <span className="badge" style={{ marginBottom: "0.75rem" }}>ZK CIRCUITS 3 – 6</span>
        <h1 className="section-title">Fund Manager<br />Console</h1>
        <p className="section-desc" style={{ maxWidth: 540 }}>
          Anchor General Partner authority, revoke investor accreditations, rotate fund offerings, and advance epoch sessions.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 220px)" }}>
        {/* Left: forms */}
        <div style={{ padding: "3rem 2.5rem 3rem 5rem", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          {/* Manager Key */}
          <div>
            <label className="label">GP Signing Key (shared across all operations)</label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input className="input" value={managerKey} onChange={e => setManagerKey(e.target.value)}
                placeholder="Enter fund manager signing key or generate entropy"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }} />
              <button type="button" onClick={handleGenerateManagerKey} className="btn-outline" style={{ whiteSpace: "nowrap", padding: "0.55rem 0.9rem", fontSize: "0.78rem" }}>
                Generate
              </button>
            </div>
          </div>

          <hr className="divider" style={{ margin: 0 }} />

          {/* Set Manager Commitment */}
          <form onSubmit={handleSetManagerCommitment}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "1.25rem" }}>
              1 — Anchor Fund Manager Authority
            </h2>
            <div style={F}>
              <label className="label">Minimum Net Worth Threshold (USD)</label>
              <input className="input" type="number" value={minThreshold} onChange={e => setMinThreshold(Number(e.target.value))} min={0} step={100000} />
            </div>
            <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: "100%", justifyContent: "center", padding: "0.7rem" }}>
              {loadingManager ? "Anchoring Authority..." : "Set Fund Manager Commitment"}
            </button>
          </form>

          <hr className="divider" style={{ margin: 0 }} />

          {/* Revoke Investor */}
          <form onSubmit={handleRevokeInvestor}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "1.25rem" }}>
              2 — Revoke Investor Accreditation
            </h2>
            <div style={F}>
              <label className="label">Investor Commitment Hash to Revoke</label>
              <input className="input" value={revokeCommitment} onChange={e => setRevokeCommitment(e.target.value)}
                placeholder="0x..." style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }} />
            </div>
            <button type="submit" className="btn-outline" disabled={isLoading} style={{ width: "100%", justifyContent: "center", padding: "0.7rem" }}>
              {loadingRevoke ? "Revoking..." : "Revoke Accreditation On-Chain"}
            </button>
          </form>

          <hr className="divider" style={{ margin: 0 }} />

          {/* Reset Fund */}
          <form onSubmit={handleResetFund}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "1.25rem" }}>
              3 — Rotate Fund Offering
            </h2>
            <div style={F}>
              <label className="label">New Fund ID</label>
              <input className="input" value={newFundId} onChange={e => setNewFundId(e.target.value)} />
            </div>
            <div style={F}>
              <label className="label">New Minimum Threshold (USD)</label>
              <input className="input" type="number" value={resetMinThreshold} onChange={e => setResetMinThreshold(Number(e.target.value))} min={0} step={100000} />
            </div>
            <button type="submit" className="btn-outline" disabled={isLoading} style={{ width: "100%", justifyContent: "center", padding: "0.7rem" }}>
              {loadingReset ? "Rotating Fund..." : "Reset Investment Fund"}
            </button>
          </form>

          <hr className="divider" style={{ margin: 0 }} />

          {/* Increment Session */}
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.75rem" }}>
              4 — Advance Epoch Session
            </h2>
            <p style={{ fontSize: "0.83rem", color: "var(--fg-3)", marginBottom: "1rem" }}>
              Rotates the on-chain session counter, invalidating current-epoch nullifiers.
            </p>
            <button onClick={handleIncrementSession} className="btn-outline" disabled={isLoading} style={{ width: "100%", justifyContent: "center", padding: "0.7rem" }}>
              {loadingSession ? "Advancing Session..." : "Increment Session Counter"}
            </button>
          </div>
        </div>

        {/* Right: log + result */}
        <div style={{ padding: "3rem 5rem 3rem 2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg-3)", marginBottom: "0.5rem" }}>
              ZK Circuit Log
            </div>
            <div className="terminal" style={{ minHeight: 220 }}>
              {logs.length === 0
                ? <span style={{ color: "var(--fg-4)" }}>$ waiting for circuit execution...</span>
                : logs.map((l, i) => <div key={i} className={`log-${l.type}`}>{l.msg}</div>)}
            </div>
          </div>

          {result && (
            <div className="card" style={{ border: "1.5px solid var(--fg)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "1rem" }}>
                Transaction Result
              </div>
              {[
                { label: "Circuit", val: result.circuit },
                { label: "Tx Hash", val: result.txHash },
                { label: "Session", val: result.sessionNumber },
                { label: "Block", val: result.blockHeight },
              ].map(({ label, val }) => val !== undefined && (
                <div key={label} style={{ marginBottom: "0.75rem" }}>
                  <div className="label" style={{ marginBottom: "0.2rem" }}>{label}</div>
                  <code className="mono-text">{String(val)}</code>
                </div>
              ))}
            </div>
          )}

          <div className="card-sm">
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
              Protected Circuits
            </div>
            {[
              "setFundManagerCommitment(Uint<32>)",
              "revokeInvestorAccreditation(Bytes<32>)",
              "resetInvestmentFund(Bytes<32>, Uint<32>)",
              "incrementSession()",
            ].map(c => (
              <div key={c} style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--fg-3)", lineHeight: 2 }}>
                · {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
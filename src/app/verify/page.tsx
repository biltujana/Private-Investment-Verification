"use client";

import { useState } from "react";
import { getClient, NETWORK_CONFIG, generateSecureEntropy, type PrivateInvestmentVerificationClient } from "../../lib/contract";
import Link from "next/link";

export default function VerifyInvestorPage() {
  const [fundId, setFundId] = useState("fund_sequoia_growth_vi");
  const [investorSecretKey, setInvestorSecretKey] = useState("");
  const [cpaAuditDoc, setCpaAuditDoc] = useState("");
  const [netWorthUsd, setNetWorthUsd] = useState(2500000);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [claimedCommitment, setClaimedCommitment] = useState("");
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<{ msg: string; type: string }[]>([]);

  const addLog = (msg: string, type = "info") => setLogs(l => [...l, { msg, type }]);

  const handleGenerateKey = () => {
    const key = generateSecureEntropy();
    setInvestorSecretKey(key);
    addLog(`> [ENTROPY] Generated 256-bit investor key: ${key.slice(0, 16)}...`, "info");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyInvestor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setLogs([]); setResult(null); setVerifyResult(null);
    try {
      addLog("> [WALLET] Connecting to 1am Wallet via @midnight-ntwrk/dapp-connector-api...", "info");
      addLog(`> [NETWORK] NetworkId: ${NETWORK_CONFIG.networkId}`, "info");
      addLog("> [ZK WITNESS] investorSecretKey() loaded in browser memory", "info");
      addLog("> [ZK WITNESS] financialAuditProofHash() — CPA audit hashed locally (SHA-256)", "info");
      addLog(`> [ZK WITNESS] netWorthAmount() = $${netWorthUsd.toLocaleString()} USD`, "info");
      addLog("> [CIRCUIT] Invoking callTx.verifyInvestorEligibility(Bytes<32>)...", "info");
      const client: PrivateInvestmentVerificationClient = getClient();
      const activeKey = investorSecretKey.trim() || client.getOrGenerateInvestorKey();
      client.setInvestorKey(activeKey);
      if (cpaAuditDoc.trim()) client.setAuditProofHash(cpaAuditDoc.trim());
      client.setNetWorthAmount(netWorthUsd);
      const res = await client.callTx.verifyInvestorEligibility(fundId);
      setResult(res); setClaimedCommitment(res.commitmentHex || "");
      addLog("> [SUCCESS] ZK commitment anchored on-chain!", "success");
      addLog(`> [COMMITMENT] ${res.commitmentHex}`, "success");
      addLog(`> [NULLIFIER] ${res.nullifierHex}`, "success");
      addLog(`> [SESSION] Epoch #${res.sessionNumber}`, "success");
      addLog(`> [TX] ${res.txHash}`, "success");
    } catch (err: any) {
      addLog(`> [ERROR] ${err?.message || err}`, "error");
    } finally { setLoading(false); }
  };

  const handleVerifyCommitment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimedCommitment) return;
    setVerifyLoading(true); setVerifyResult(null);
    try {
      addLog(`> [PUBLIC VERIFY] callTx.verifyInvestmentCommitment(${claimedCommitment.slice(0, 16)}...)`, "info");
      const client = getClient();
      const res = await client.callTx.verifyInvestmentCommitment(claimedCommitment);
      setVerifyResult(res);
      addLog("> [VERIFIED] Commitment valid on Midnight Preview ledger.", "success");
    } catch (err: any) {
      addLog(`> [FAILED] ${err?.message || err}`, "error");
    } finally { setVerifyLoading(false); }
  };

  const F: React.CSSProperties = { marginBottom: "1.25rem" };

  return (
    <div>
      {/* Page header */}
      <div style={{ padding: "3rem 5rem 2rem", borderBottom: "1px solid var(--border)" }}>
        <span className="badge" style={{ marginBottom: "0.75rem" }}>ZK CIRCUITS 1 & 2</span>
        <h1 className="section-title">Verify Investor<br />Accreditation</h1>
        <p className="section-desc" style={{ maxWidth: 540 }}>
          Generate a zero-knowledge accredited investor proof locally. Your net worth and identity never leave this browser.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 220px)" }}>
        {/* Left: form */}
        <div style={{ padding: "3rem 2.5rem 3rem 5rem", borderRight: "1px solid var(--border)" }}>
          <form onSubmit={handleVerifyInvestor}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "1.75rem" }}>
              Step 1 — Private Financial Witnesses
            </h2>

            <div style={F}>
              <label className="label">Target Fund ID</label>
              <input className="input" value={fundId} onChange={e => setFundId(e.target.value)}
                placeholder="e.g. fund_sequoia_growth_vi" />
            </div>

            <div style={F}>
              <label className="label">Investor Secret Key (256-bit)</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input className="input" value={investorSecretKey} onChange={e => setInvestorSecretKey(e.target.value)}
                  placeholder="Enter private key or generate entropy" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }} />
                <button type="button" onClick={handleGenerateKey} className="btn-outline" style={{ whiteSpace: "nowrap", padding: "0.55rem 0.9rem", fontSize: "0.78rem" }}>
                  Generate
                </button>
              </div>
            </div>

            <div style={F}>
              <label className="label">Net Worth (USD)</label>
              <input className="input" type="number" value={netWorthUsd} onChange={e => setNetWorthUsd(Number(e.target.value))}
                min={0} step={100000} />
              <div style={{ fontSize: "0.72rem", color: "var(--fg-4)", marginTop: "0.3rem" }}>
                Minimum threshold: $2,500,000 USD (asserted in ZK)
              </div>
            </div>

            <div style={F}>
              <label className="label">CPA Audit Report Hash (optional)</label>
              <input className="input" value={cpaAuditDoc} onChange={e => setCpaAuditDoc(e.target.value)}
                placeholder="SHA-256 hash or leave blank for auto-generation" />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: "100%", justifyContent: "center", padding: "0.75rem", fontSize: "0.9rem", marginTop: "0.5rem" }}>
              {loading ? "Generating ZK Proof..." : "Generate & Submit ZK Proof"}
            </button>
          </form>

          {/* Verify commitment form */}
          {claimedCommitment && (
            <form onSubmit={handleVerifyCommitment} style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "1.25rem" }}>
                Step 2 — Verify On-Chain Commitment
              </h2>
              <div style={F}>
                <label className="label">Commitment Hash</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input className="input" value={claimedCommitment} onChange={e => setClaimedCommitment(e.target.value)}
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }} />
                  <button type="button" onClick={() => handleCopy(claimedCommitment)} className="btn-outline" style={{ padding: "0.55rem 0.9rem", fontSize: "0.78rem" }}>
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-outline" disabled={verifyLoading}
                style={{ width: "100%", justifyContent: "center", padding: "0.65rem" }}>
                {verifyLoading ? "Verifying..." : "Verify Commitment On-Chain"}
              </button>
            </form>
          )}
        </div>

        {/* Right: logs + result */}
        <div style={{ padding: "3rem 5rem 3rem 2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Terminal */}
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg-3)", marginBottom: "0.5rem" }}>
              ZK Circuit Log
            </div>
            <div className="terminal" style={{ minHeight: 180 }}>
              {logs.length === 0 ? (
                <span style={{ color: "var(--fg-4)" }}>$ waiting for circuit execution...</span>
              ) : logs.map((l, i) => (
                <div key={i} className={`log-${l.type}`}>{l.msg}</div>
              ))}
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="card" style={{ border: "1.5px solid var(--fg)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>
                Accreditation Result
              </div>
              {[
                { label: "Commitment", val: result.commitmentHex },
                { label: "Nullifier", val: result.nullifierHex },
                { label: "Session", val: result.sessionNumber },
                { label: "Tx Hash", val: result.txHash },
                { label: "Circuit", val: result.circuit },
              ].map(({ label, val }) => val && (
                <div key={label} style={{ marginBottom: "0.75rem" }}>
                  <div className="label" style={{ marginBottom: "0.2rem" }}>{label}</div>
                  <code className="mono-text">{String(val)}</code>
                </div>
              ))}
            </div>
          )}

          {verifyResult && (
            <div className="card" style={{ border: "1.5px solid var(--border-2)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Verification Result
              </div>
              <code className="mono-text">{JSON.stringify(verifyResult, null, 2)}</code>
            </div>
          )}

          {/* Info box */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "1.25rem" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
              Private Witnesses (never leave browser)
            </div>
            {["investorSecretKey()", "financialAuditProofHash()", "netWorthAmount()", "verificationProofNonce()", "fundManagerSigningKey()"].map(w => (
              <div key={w} style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--fg-3)", lineHeight: 2 }}>
                · {w}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
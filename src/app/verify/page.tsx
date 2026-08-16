"use client";

import { useState } from "react";
import { getClient } from "../../lib/contract";
import Link from "next/link";

export default function VerifyInvestorPage() {
  const [fundId, setFundId] = useState("fund_sequoia_growth_vi");
  const [investorSecretKey, setInvestorSecretKey] = useState("");
  const [cpaAuditDoc, setCpaAuditDoc] = useState("");
  const [netWorthUsd, setNetWorthUsd] = useState(2500000);
  const [dealComments, setDealComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [claimedCommitment, setClaimedCommitment] = useState("");
  const [logs, setLogs] = useState<{ msg: string; type: string }[]>([]);

  const addLog = (msg: string, type = "info") => setLogs(l => [...l, { msg, type }]);

  const handleVerifyInvestor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLogs([]);
    setResult(null);
    setVerifyResult(null);

    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet session...", "info");
      addLog(`> [ZK WITNESS] investorSecretKey() — private investor secret loaded`, "info");
      addLog(`> [ZK WITNESS] financialAuditProofHash() — CPA audit report hashed locally (SHA-256)`, "info");
      addLog(`> [ZK WITNESS] netWorthAmount() = $${netWorthUsd.toLocaleString()} USD (asserting >= $1,000,000 threshold)...`, "info");
      addLog(`> [CIRCUIT] Invoking verifyInvestorEligibility(Bytes<32>) on Midnight Preview...`, "info");

      const client = getClient();
      client.setInvestorKey(investorSecretKey || "sample_investor_secret_key");
      client.setAuditProofHash(cpaAuditDoc || "sample_cpa_audit_report_hash");
      client.setNetWorthAmount(netWorthUsd);

      const res = await client.verifyInvestorEligibility(fundId);

      setResult(res);
      setClaimedCommitment(res.commitmentHex);
      addLog(`> [SUCCESS] ZK Investor Accreditation commitment anchored on-chain!`, "success");
      addLog(`> [COMMITMENT] ${res.commitmentHex}`, "success");
      addLog(`> [TX HASH] ${res.txHash}`, "success");
      addLog(`> [FEE] ${res.txFee} ${res.txFeeAsset} paid by ${res.signedBy}`, "success");
    } catch (err: any) {
      addLog(`> [ERROR] ${err?.message || err}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCommitment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimedCommitment) return;
    setVerifyLoading(true);
    try {
      addLog(`> [CIRCUIT] Executing verifyInvestmentCommitment(Bytes<32>) for commitment...`, "info");
      const client = getClient();
      const res = await client.verifyInvestmentCommitment(claimedCommitment);
      setVerifyResult(res);
      addLog(`> [VERIFY] On-chain proof verification status: ${res.matches ? "VALID" : "INVALID"}`, res.matches ? "success" : "error");
    } catch (err: any) {
      addLog(`> [VERIFY ERROR] ${err?.message || err}`, "error");
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
          <span className="badge badge-sapphire">Accreditation Prover</span>
          <span className="badge badge-cyan">Client Prover</span>
          <span className="badge badge-gold">Midnight Preview</span>
        </div>
        <h1 className="section-title">Investor Accreditation Portal</h1>
        <p className="section-desc">
          Prove your accredited investor net worth threshold ($1,000,000+ USD) in zero-knowledge. Your exact bank balances, tax documents, and legal identity are never published on-chain.
        </p>
      </div>

      {/* ── Verification Form Card ── */}
      <div className="glass-card" style={{ padding: "2rem", marginBottom: "2rem", borderLeft: "3px solid #3b82f6" }}>
        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#3b82f6", marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          🔒 Step 1 — Investor Proof Parameters
        </div>

        <form onSubmit={handleVerifyInvestor} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.4rem" }}>
              Target Investment Fund / Syndicate ID (Public Parameter)
            </label>
            <input
              type="text"
              id="fundId"
              value={fundId}
              onChange={e => setFundId(e.target.value)}
              placeholder="e.g. fund_sequoia_growth_vi"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.4rem" }}>
                Investor Secret Key (ZK Witness — investorSecretKey())
              </label>
              <input
                type="password"
                id="investorSecretKey"
                value={investorSecretKey}
                onChange={e => setInvestorSecretKey(e.target.value)}
                placeholder="Private key (never leaves your browser)"
                autoComplete="off"
              />
            </div>

            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.4rem" }}>
                CPA Audit / Bank Certification (ZK Witness)
              </label>
              <input
                type="text"
                id="cpaAuditDoc"
                value={cpaAuditDoc}
                onChange={e => setCpaAuditDoc(e.target.value)}
                placeholder="e.g. AUDIT-2026-DELOITTE-098 (hashed locally in SHA-256)"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.5rem" }}>
              Qualified Net Worth: <span style={{ color: "#10b981", fontWeight: 700 }}>${netWorthUsd.toLocaleString()} USD</span> {netWorthUsd >= 1000000 ? "(✅ Accredited Investor Qualified)" : "(⚠️ Below $1M Threshold)"}
            </label>
            <input
              type="range"
              min={500000}
              max={10000000}
              step={100000}
              value={netWorthUsd}
              onChange={e => setNetWorthUsd(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#3b82f6" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#64748b", marginTop: "0.25rem" }}>
              <span>$500k (Non-Accredited)</span>
              <span>$1.0M (Accreditation Min)</span>
              <span>$5.0M (Qualified Client)</span>
              <span>$10.0M+ (Qualified Purchaser)</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.4rem" }}>
              Allocation Commitment Notes (Optional)
            </label>
            <textarea
              rows={3}
              id="dealComments"
              value={dealComments}
              onChange={e => setDealComments(e.target.value)}
              placeholder="e.g. Indicative ticket allocation $250,000 USD for Series B lead syndicate."
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            id="verifyInvestorBtn"
            style={{ marginTop: "0.5rem" }}
          >
            {loading ? (
              <>
                <span className="spinner" /> Generating ZK Proof & Submitting...
              </>
            ) : (
              "🔒 Generate ZK Proof & Verify Accreditation"
            )}
          </button>
        </form>
      </div>

      {/* ── Activity Execution Log ── */}
      {logs.length > 0 && (
        <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            ZK Prover & Activity Log
          </div>
          <div className="log-box">
            {logs.map((l, i) => (
              <div key={i} className={`log-${l.type}`}>{l.msg}</div>
            ))}
          </div>
        </div>
      )}

      {/* ── Submission Result Card ── */}
      {result && (
        <div className="glass-card fade-in" style={{ padding: "1.75rem", marginBottom: "2rem", border: "1px solid rgba(59, 130, 246, 0.4)", background: "rgba(59, 130, 246, 0.04)" }}>
          <div style={{ color: "#3b82f6", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem" }}>
            ✅ ZK Investor Accreditation Successfully Anchored On-Chain
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Accreditation Commitment Hash (Bytes&lt;32&gt;):</span>
              <code style={{ display: "block", fontSize: "0.82rem", color: "#3b82f6", wordBreak: "break-all", marginTop: "0.2rem" }}>
                {result.commitmentHex}
              </code>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Transaction Hash:</span>
              <code style={{ display: "block", fontSize: "0.82rem", color: "#06b6d4", wordBreak: "break-all", marginTop: "0.2rem" }}>
                {result.txHash}
              </code>
            </div>

            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Accreditation Status:</span>
                <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#10b981" }}>✅ Verified Accredited Investor</div>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Transaction Fee:</span>
                <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#f8fafc" }}>{result.txFee} {result.txFeeAsset}</div>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Signed By:</span>
                <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#94a3b8" }}>{result.signedBy}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Public Verification Card ── */}
      <div className="glass-card" style={{ padding: "1.75rem", borderLeft: "3px solid #06b6d4" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#06b6d4", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          🔍 Step 2 — Verify Investor Commitment (Public Circuit)
        </div>
        <p style={{ fontSize: "0.83rem", color: "#94a3b8", marginBottom: "1rem" }}>
          Fund managers and auditors can independently verify that an accreditation commitment exists in the latest public on-chain ledger state without knowing the investor identity or balance.
        </p>

        <form onSubmit={handleVerifyCommitment} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <input
            type="text"
            id="claimedCommitment"
            value={claimedCommitment}
            onChange={e => setClaimedCommitment(e.target.value)}
            placeholder="0x... accreditation commitment hash to verify"
            style={{ flex: 1, minWidth: 260 }}
            required
          />
          <button type="submit" className="btn-secondary" disabled={verifyLoading || !claimedCommitment} id="verifyCommitmentBtn">
            {verifyLoading ? <><span className="spinner" /> Verifying...</> : "Verify On-Chain"}
          </button>
        </form>

        {verifyResult && (
          <div className="fade-in" style={{ marginTop: "1rem", padding: "1rem", borderRadius: "8px", background: verifyResult.matches ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", border: `1px solid ${verifyResult.matches ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}` }}>
            <span style={{ fontWeight: 700, color: verifyResult.matches ? "#10b981" : "#ef4444" }}>
              {verifyResult.matches ? "✅ Valid: Accreditation commitment confirmed in on-chain ledger state!" : "❌ Invalid: Commitment not found or mismatched."}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", flexWrap: "wrap" }}>
        <Link href="/" className="btn-secondary">Back to Dashboard</Link>
        <Link href="/manager" className="btn-secondary">Fund Manager Console</Link>
        <Link href="/explorer" className="btn-primary">View on Chain Explorer →</Link>
      </div>
    </div>
  );
}

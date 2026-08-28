"use client";

import { useState } from "react";
import { getClient, NETWORK_CONFIG, type PrivateInvestmentVerificationClient } from "../../lib/contract";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { MidnightProviders } from "@midnight-ntwrk/midnight-js-types";
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
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<{ msg: string; type: string }[]>([]);

  const addLog = (msg: string, type = "info") => setLogs(l => [...l, { msg, type }]);

  const handleCopyCommitment = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyInvestor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLogs([]);
    setResult(null);
    setVerifyResult(null);

    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet via @midnight-ntwrk/dapp-connector-api...", "info");
      addLog(`> [NETWORK] Using Midnight Network (NetworkId: ${NETWORK_CONFIG.networkId})`, "info");
      addLog(`> [ZK WITNESS] investorSecretKey() - private investor secret loaded in browser memory`, "info");
      addLog(`> [ZK WITNESS] financialAuditProofHash() - CPA audit report hashed locally (SHA-256)`, "info");
      addLog(`> [ZK WITNESS] netWorthAmount() = $${netWorthUsd.toLocaleString()} USD (asserting >= $2,500,000 threshold in ZK)...`, "info");
      addLog(`> [CIRCUIT CALL] Executing verifyInvestorEligibility(Bytes<32>) on Midnight Preview...`, "info");

      const client: PrivateInvestmentVerificationClient = getClient();
      client.setInvestorKey(investorSecretKey || "sample_investor_secret_key");
      client.setAuditProofHash(cpaAuditDoc || "sample_cpa_audit_report_hash");
      client.setNetWorthAmount(netWorthUsd);

      const res = await client.verifyInvestorEligibility(fundId);

      setResult(res);
      setClaimedCommitment(res.commitmentHex);
      addLog(`> [SUCCESS] ZK Accredited Investor Commitment successfully anchored on-chain!`, "success");
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
      addLog(`> [CIRCUIT CALL] Executing verifyInvestmentCommitment(Bytes<32>) on-chain...`, "info");
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
          <span className="badge badge-emerald">Investor Prover</span>
          <span className="badge badge-cyan">Circuit: verifyInvestorEligibility</span>
          <span className="badge badge-gold">Midnight Preview</span>
        </div>
        <h1 className="section-title">Investor Accreditation & Capital Attestation</h1>
        <p className="section-desc">
          Prove accredited investor qualification &amp; net worth compliance in zero-knowledge. Your net worth amount, bank records, and personal identity remain strictly confidential.
        </p>
      </div>

      {/* ── Submission Form Card ── */}
      <div className="glass-card" style={{ padding: "2rem", marginBottom: "2rem", borderLeft: "3px solid #10b981" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            🔒 Step 1 — Smart Contract Circuit Parameters
          </div>
          <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#38bdf8", background: "rgba(6, 182, 212, 0.1)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
            circuit: verifyInvestorEligibility(Bytes&lt;32&gt;)
          </span>
        </div>

        <form onSubmit={handleVerifyInvestor} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.4rem" }}>
              Target Investment Fund Identifier (Public Contract Parameter)
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
                CPA / Audit Statement Document (ZK Witness — financialAuditProofHash())
              </label>
              <input
                type="text"
                id="cpaAuditDoc"
                value={cpaAuditDoc}
                onChange={e => setCpaAuditDoc(e.target.value)}
                placeholder="e.g. CPA-AUDIT-2026-DELOITTE-789 (hashed locally in SHA-256)"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.5rem" }}>
              Certified Net Worth (ZK Assertion): <span style={{ color: "#10b981", fontWeight: 700 }}>${netWorthUsd.toLocaleString()} USD</span>
            </label>
            <input
              type="range"
              min={1000000}
              max={10000000}
              step={250000}
              value={netWorthUsd}
              onChange={e => setNetWorthUsd(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#10b981" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#64748b", marginTop: "0.25rem" }}>
              <span>$1.0M (Accredited Floor)</span>
              <span>$2.5M (Fund Threshold)</span>
              <span>$5.0M (Qualified Purchaser)</span>
              <span>$10.0M+ (Institutional)</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.4rem" }}>
              Investment Allocation Notes (Optional Confidential Strategy)
            </label>
            <textarea
              rows={3}
              id="dealComments"
              value={dealComments}
              onChange={e => setDealComments(e.target.value)}
              placeholder="e.g. Subscribing for Class A LP interests. Allocation subject to Q3 capital call."
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
                <span className="spinner" /> Executing verifyInvestorEligibility() & Generating ZK Proof...
              </>
            ) : (
              "🔒 Execute verifyInvestorEligibility() Circuit & Anchor On-Chain"
            )}
          </button>
        </form>
      </div>

      {/* ── Activity Execution Log ── */}
      {logs.length > 0 && (
        <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            ZK Prover & Smart Contract Activity Log
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
        <div className="glass-card fade-in" style={{ padding: "1.75rem", marginBottom: "2rem", border: "1px solid rgba(16, 185, 129, 0.4)", background: "rgba(16, 185, 129, 0.04)" }}>
          <div style={{ color: "#10b981", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem" }}>
            ✅ ZK Accreditation Commitment Successfully Confirmed on Midnight Preview
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Accreditation Commitment Hash (Bytes&lt;32&gt;):</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem" }}>
                <code style={{ fontSize: "0.82rem", color: "#10b981", wordBreak: "break-all" }}>
                  {result.commitmentHex}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopyCommitment(result.commitmentHex)}
                  style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem", cursor: "pointer" }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Transaction Hash:</span>
              <code style={{ display: "block", fontSize: "0.82rem", color: "#06b6d4", wordBreak: "break-all", marginTop: "0.2rem" }}>
                {result.txHash}
              </code>
            </div>

            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Accreditation Verified:</span>
                <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#10b981" }}>✅ Net Worth ≥ $2,500,000 Verified</div>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            🔍 Step 2 — Verify Investment Commitment (Public Circuit)
          </div>
          <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#38bdf8", background: "rgba(6, 182, 212, 0.1)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
            circuit: verifyInvestmentCommitment(Bytes&lt;32&gt;)
          </span>
        </div>
        <p style={{ fontSize: "0.83rem", color: "#94a3b8", marginBottom: "1rem" }}>
          Fund managers and auditors can verify that a specific investor accreditation commitment exists in the latest public on-chain ledger state without knowing the investor identity.
        </p>

        <form onSubmit={handleVerifyCommitment} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <input
            type="text"
            id="claimedCommitment"
            value={claimedCommitment}
            onChange={e => setClaimedCommitment(e.target.value)}
            placeholder="0x... investment commitment hash to verify"
            style={{ flex: 1, minWidth: 260 }}
            required
          />
          <button type="submit" className="btn-secondary" disabled={verifyLoading || !claimedCommitment} id="verifyCommitmentBtn">
            {verifyLoading ? <><span className="spinner" /> Verifying...</> : "Verify On-Chain (Circuit)"}
          </button>
        </form>

        {verifyResult && (
          <div className="fade-in" style={{ marginTop: "1rem", padding: "1rem", borderRadius: "8px", background: verifyResult.matches ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", border: `1px solid ${verifyResult.matches ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}` }}>
            <span style={{ fontWeight: 700, color: verifyResult.matches ? "#10b981" : "#ef4444" }}>
              {verifyResult.matches ? "✅ Valid: Investor accreditation commitment confirmed in on-chain ledger state!" : "❌ Invalid: Commitment not found or mismatched."}
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

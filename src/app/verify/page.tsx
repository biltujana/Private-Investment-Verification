"use client";

import { useState } from "react";
import { getClient, NETWORK_CONFIG, generateSecureEntropy, type PrivateInvestmentVerificationClient } from "../../lib/contract";
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

  const handleGenerateKey = () => {
    const key = generateSecureEntropy();
    setInvestorSecretKey(key);
    addLog(`> [ENTROPY] Generated secure 256-bit investor secret key: ${key.slice(0, 16)}...`, "info");
  };

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
      addLog("> [ZK WITNESS] investorSecretKey() - private investor secret loaded in browser memory", "info");
      addLog("> [ZK WITNESS] financialAuditProofHash() - CPA audit report hashed locally (SHA-256)", "info");
      addLog(`> [ZK WITNESS] netWorthAmount() = $${netWorthUsd.toLocaleString()} USD (asserting >= $2,500,000 threshold in ZK)...`, "info");
      addLog("> [CIRCUIT CALL] Invoking generated callTx.verifyInvestorEligibility(Bytes<32>)...", "info");

      const client: PrivateInvestmentVerificationClient = getClient();
      
      // Use user-provided key or generate cryptographically secure key (No hardcoded default secrets!)
      const activeKey = investorSecretKey.trim() || client.getOrGenerateInvestorKey();
      client.setInvestorKey(activeKey);

      if (cpaAuditDoc.trim()) {
        client.setAuditProofHash(cpaAuditDoc.trim());
      }
      client.setNetWorthAmount(netWorthUsd);

      const res = await client.callTx.verifyInvestorEligibility(fundId);

      setResult(res);
      setClaimedCommitment(res.commitmentHex || "");
      addLog("> [SUCCESS] ZK Accredited Investor Commitment successfully anchored on-chain!", "success");
      addLog(`> [COMMITMENT] ${res.commitmentHex}`, "success");
      addLog(`> [NULLIFIER] ${res.nullifierHex} (Replay Protection Active)`, "success");
      addLog(`> [SESSION] Bound to active epoch session #${res.sessionNumber}`, "success");
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
    setVerifyResult(null);

    try {
      addLog(`> [PUBLIC VERIFICATION] Calling callTx.verifyInvestmentCommitment(${claimedCommitment.slice(0, 16)}...)`, "info");
      const client = getClient();
      const res = await client.callTx.verifyInvestmentCommitment(claimedCommitment);
      setVerifyResult(res);
      addLog("> [VERIFIED] Commitment confirmed valid and active on Midnight Preview ledger.", "success");
    } catch (err: any) {
      addLog(`> [VERIFICATION FAILED] ${err?.message || err}`, "error");
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-emerald">Accredited Investor Portal</span>
          <span className="badge badge-cyan">ZK Circuit 1 & 2</span>
          <span className="badge badge-indigo">Replay Prevention</span>
        </div>
        <h1 className="section-title">Verify Investor Accreditation</h1>
        <p className="section-desc">
          Generate an accredited investor zero-knowledge proof locally on your device. Your net worth, financial balances, and identity remain strictly confidential.
        </p>
      </div>

      <div className="glass-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.5rem", color: "#f8fafc" }}>
          Step 1: Configure Private Financial Witnesses
        </h2>

        <form onSubmit={handleVerifyInvestor}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "0.5rem" }}>
              Target Investment Fund ID (Public on-chain check)
            </label>
            <input
              type="text"
              className="input-field"
              value={fundId}
              onChange={e => setFundId(e.target.value)}
              placeholder="e.g. fund_sequoia_growth_vi"
              required
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1" }}>
                Investor Private Secret Key (ZK Witness - Never Broadcast)
              </label>
              <button
                type="button"
                onClick={handleGenerateKey}
                style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", color: "#10b981", borderRadius: "6px", fontSize: "0.75rem", padding: "0.2rem 0.6rem", cursor: "pointer" }}
              >
                + Generate Secure Key
              </button>
            </div>
            <input
              type="password"
              className="input-field"
              value={investorSecretKey}
              onChange={e => setInvestorSecretKey(e.target.value)}
              placeholder="Enter private key or generate secure entropy"
            />
            <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem", display: "block" }}>
              Remains inside browser memory; never sent to RPC node or indexer.
            </span>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "0.5rem" }}>
              CPA Financial Audit Report (ZK Witness Document Hash)
            </label>
            <input
              type="text"
              className="input-field"
              value={cpaAuditDoc}
              onChange={e => setCpaAuditDoc(e.target.value)}
              placeholder="Paste CPA audit report SHA-256 hash or leaves blank for auto-generation"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "0.5rem" }}>
              Certified Net Worth in USD: <strong style={{ color: "#10b981" }}>${netWorthUsd.toLocaleString()}</strong>
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
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b" }}>
              <span>$1.0M (Unaccredited)</span>
              <span style={{ color: "#06b6d4" }}>$2.5M (SEC Accreditation Threshold)</span>
              <span>$10.0M+ (High Net Worth)</span>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "0.85rem" }}
            disabled={loading}
          >
            {loading ? "Generating ZK Proof & Submitting to Midnight..." : "Prove Accreditation & Anchor Commitment"}
          </button>
        </form>
      </div>

      {logs.length > 0 && (
        <div className="terminal-box" style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>
            Live SNARK Execution & Telemetry Log
          </div>
          {logs.map((l, i) => (
            <div key={i} style={{ color: l.type === "error" ? "#f43f5e" : l.type === "success" ? "#10b981" : "#94a3b8", marginBottom: "0.25rem" }}>
              {l.msg}
            </div>
          ))}
        </div>
      )}

      {result && (
        <div className="glass-card" style={{ padding: "2rem", marginBottom: "2rem", border: "1px solid rgba(16, 185, 129, 0.4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <span style={{ fontSize: "1.5rem" }}>OK</span>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#10b981" }}>
              Accredited Investor Proof Verified & Committed
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
            <div>
              <span style={{ color: "#64748b" }}>Commitment Hash:</span>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                <code style={{ background: "rgba(0, 0, 0, 0.4)", padding: "0.4rem 0.6rem", borderRadius: "6px", color: "#06b6d4", wordBreak: "break-all", flex: 1 }}>
                  {result.commitmentHex}
                </code>
                <button
                  onClick={() => handleCopyCommitment(result.commitmentHex)}
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "#f8fafc", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem" }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div>
              <span style={{ color: "#64748b" }}>Replay Protection Nullifier:</span>
              <div style={{ marginTop: "0.25rem" }}>
                <code style={{ background: "rgba(0, 0, 0, 0.4)", padding: "0.4rem 0.6rem", borderRadius: "6px", color: "#eab308", wordBreak: "break-all", display: "block" }}>
                  {result.nullifierHex}
                </code>
              </div>
            </div>

            <div style={{ display: "flex", gap: "2rem", marginTop: "0.5rem" }}>
              <div>
                <span style={{ color: "#64748b" }}>Session:</span>
                <span style={{ color: "#f8fafc", marginLeft: "0.5rem", fontWeight: 600 }}>Epoch #{result.sessionNumber}</span>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Status:</span>
                <span style={{ color: "#10b981", marginLeft: "0.5rem", fontWeight: 600 }}>CONFIRMED</span>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Fee:</span>
                <span style={{ color: "#f8fafc", marginLeft: "0.5rem" }}>{result.txFee} {result.txFeeAsset}</span>
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <a
                href={NETWORK_CONFIG.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ fontSize: "0.8rem", display: "inline-flex" }}
              >
                View on Midnight Explorer
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Public Verification Section */}
      <div className="glass-card" style={{ padding: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", color: "#f8fafc" }}>
          Step 2: Public Proof Verification (Circuit 2)
        </h2>
        <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "1.25rem" }}>
          Verify that an investor commitment is authentically anchored on the Midnight ledger without possessing any private financial information.
        </p>

        <form onSubmit={handleVerifyCommitment}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "0.5rem" }}>
              Claimed Investor Commitment Hash
            </label>
            <input
              type="text"
              className="input-field"
              value={claimedCommitment}
              onChange={e => setClaimedCommitment(e.target.value)}
              placeholder="0x..."
              required
            />
          </div>

          <button
            type="submit"
            className="btn-secondary"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={verifyLoading}
          >
            {verifyLoading ? "Verifying with Midnight Node..." : "Verify Commitment On-Chain"}
          </button>
        </form>

        {verifyResult && (
          <div style={{ marginTop: "1rem", padding: "1rem", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px" }}>
            <span style={{ color: "#10b981", fontWeight: 600 }}>Accreditation Proof Valid: </span>
            <span style={{ color: "#f8fafc" }}>The commitment is validly anchored on the Midnight Preview Testnet ledger.</span>
          </div>
        )}
      </div>
    </div>
  );
}

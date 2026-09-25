"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NETWORK_CONFIG, CONTRACT_ADDRESS, VERIFIED_DEPLOYMENT, getClient, type OnChainContractState } from "@/lib/contract";

export default function ExplorerPage() {
  const [onChainState, setOnChainState] = useState<OnChainContractState | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [rawJson, setRawJson] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const fetchState = async () => {
    setLoading(true);
    try {
      const client = getClient();
      const state = await client.fetchOnChainState();
      setOnChainState(state);
      setRawJson(JSON.stringify(state, null, 2));
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (e) {
      console.error("Failed to read indexer state:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "3rem 5rem 2rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <span className="badge" style={{ marginBottom: "0.75rem" }}>LIVE INDEXER API</span>
          <h1 className="section-title">Contract State<br />Explorer</h1>
          <p className="section-desc" style={{ maxWidth: 480 }}>
            Live zero-knowledge ledger state from the Midnight Preview GraphQL Indexer.
            {lastRefreshed && <span style={{ color: "var(--fg-4)", marginLeft: "0.5rem" }}>· Last queried: {lastRefreshed}</span>}
          </p>
        </div>
        <button
          onClick={fetchState}
          className="btn-outline"
          style={{ alignSelf: "flex-end", padding: "0.55rem 1.1rem", fontSize: "0.83rem" }}
          disabled={loading}
        >
          {loading ? "Reading Indexer..." : "Refresh State"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 220px)" }}>
        {/* Left: deployment info + ledger state */}
        <div style={{ padding: "3rem 2.5rem 3rem 5rem", borderRight: "1px solid var(--border)" }}>
          {/* Deployment evidence */}
          <div style={{ marginBottom: "2.5rem" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "1.25rem" }}>
              Deployment Evidence
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
              {[
                { label: "Contract Address",  val: CONTRACT_ADDRESS },
                { label: "Tx Hash",           val: VERIFIED_DEPLOYMENT.transactionHash },
                { label: "Block Height",      val: `Block #${VERIFIED_DEPLOYMENT.blockHeight}` },
                { label: "Transaction ID",    val: `#${VERIFIED_DEPLOYMENT.transactionId}` },
                { label: "Network",           val: "Midnight Preview Testnet" },
                { label: "GraphQL Indexer",   val: NETWORK_CONFIG.indexerUri },
              ].map(({ label, val }) => (
                <div key={label} style={{ background: "var(--card)", padding: "0.75rem 1rem", display: "grid", gridTemplateColumns: "140px 1fr", gap: "0.75rem", alignItems: "start" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.05em", paddingTop: "0.05rem" }}>{label}</div>
                  <code className="mono-text">{val}</code>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              <a
                href={VERIFIED_DEPLOYMENT.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
                style={{ fontSize: "0.8rem", padding: "0.45rem 0.9rem" }}
              >
                View on Midnight Explorer ↗
              </a>
            </div>
          </div>

          {/* Ledger state */}
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "1.25rem" }}>
              Live Ledger State
            </div>
            {loading && !onChainState ? (
              <div style={{ color: "var(--fg-3)", fontSize: "0.85rem" }}>Reading from Midnight Preview Indexer...</div>
            ) : onChainState ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                {[
                  { label: "Verified Count",    val: onChainState.verifiedCount?.toString() ?? "—" },
                  { label: "Revoked Count",     val: onChainState.revokedCount?.toString() ?? "—" },
                  { label: "Active Session",    val: onChainState.activeSession?.toString() ?? "—" },
                  { label: "Fund ID",           val: onChainState.fundId ?? "—" },
                  { label: "Min Threshold",     val: onChainState.minimumNetWorthThreshold ? `$${Number(onChainState.minimumNetWorthThreshold).toLocaleString()} USD` : "—" },
                  { label: "Manager Commit.",   val: onChainState.fundManagerCommitment ?? "—" },
                  { label: "Last Commitment",   val: onChainState.lastVerificationCommitment ?? "—" },
                  { label: "Last Nullifier",    val: onChainState.lastNullifier ?? "—" },
                ].map(({ label, val }) => (
                  <div key={label} style={{ background: "var(--card)", padding: "0.75rem 1rem", display: "grid", gridTemplateColumns: "140px 1fr", gap: "0.75rem", alignItems: "start" }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.05em", paddingTop: "0.05rem" }}>{label}</div>
                    <code className="mono-text">{val}</code>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "var(--fg-3)", fontSize: "0.85rem" }}>No state available from indexer.</div>
            )}
          </div>
        </div>

        {/* Right: raw JSON */}
        <div style={{ padding: "3rem 5rem 3rem 2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Raw GraphQL Response
            </div>
            {rawJson && (
              <button onClick={() => handleCopy(rawJson)} className="btn-outline" style={{ fontSize: "0.78rem", padding: "0.35rem 0.8rem" }}>
                {copied ? "Copied!" : "Copy JSON"}
              </button>
            )}
          </div>

          <div className="terminal" style={{ flex: 1, minHeight: 400, maxHeight: "none" }}>
            {rawJson
              ? <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{rawJson}</pre>
              : <span style={{ color: "var(--fg-4)" }}>$ awaiting indexer response...</span>}
          </div>

          {/* Indexer info */}
          <div className="card-sm">
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
              GraphQL Query (contract state)
            </div>
            <pre style={{ fontFamily: "var(--font-mono)", fontSize: "0.73rem", color: "var(--fg-3)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
{`query GetContractState($addr: String!) {
  contract(address: $addr) {
    state {
      verifiedCount
      revokedCount
      activeSession
      fundId
      fundManagerCommitment
      lastNullifier
      minimumNetWorthThreshold
    }
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
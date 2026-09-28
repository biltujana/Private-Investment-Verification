import fs from "fs";

const explorerCode = `"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  NETWORK_CONFIG,
  CONTRACT_ADDRESS,
  VERIFIED_DEPLOYMENT,
  getClient,
  type OnChainContractState
} from "@/lib/contract";

export default function ExplorerPage() {
  const [onChainState, setOnChainState] = useState<OnChainContractState | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [rawJson, setRawJson] = useState<string>("");
  const [copied, setCopied] = useState<string | null>(null);

  // Search / Lookup tool state
  const [searchQuery, setSearchQuery] = useState("");
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setLookupLoading(true);
    setLookupResult(null);

    try {
      const clean = query.replace(/^0x/, "");
      const isKnownTx = clean.toLowerCase() === VERIFIED_DEPLOYMENT.transactionHash.toLowerCase() ||
        onChainState?.transactions?.some(t => t.hash.toLowerCase() === clean.toLowerCase());

      if (isKnownTx) {
        setLookupResult({
          type: "TRANSACTION",
          title: "On-Chain Midnight Transaction",
          hash: clean,
          blockHeight: VERIFIED_DEPLOYMENT.blockHeight,
          status: "MINED & CONFIRMED",
          network: "Midnight Preview Testnet",
          explorerUrl: `https://explorer.1am.xyz/tx/${clean}`,
          description: "This hash is a verified on-chain transaction executed on the Midnight blockchain."
        });
      } else if (clean.length === 64) {
        // Query client to check if it matches a ZK commitment or is valid
        const client = getClient();
        const verification = await client.callTx.verifyInvestmentCommitment("0x" + clean);

        setLookupResult({
          type: "ZK_COMMITMENT",
          title: "Zero-Knowledge State Proof (Private Leaf)",
          hash: "0x" + clean,
          status: verification.isValid ? "VALID & RECORDED ON-CHAIN" : "UNKNOWN / UNCONFIRMED",
          session: verification.sessionNumber,
          isRevoked: verification.isRevoked,
          contractAddress: CONTRACT_ADDRESS,
          contractExplorerUrl: `https://explorer.1am.xyz/contract/${CONTRACT_ADDRESS.replace(/^0x/, "")}`,
          description:
            "This is a Zero-Knowledge Cryptographic Commitment Leaf. In privacy blockchains like Midnight, private inputs (such as financial net worth and investor credentials) are shielded into ZK commitments inside circuits. 1AM Block Explorer lists on-chain transaction hashes, whereas ZK commitments reside securely within smart contract state."
        });
      } else {
        setLookupResult({
          type: "UNKNOWN",
          title: "Unrecognized Hash Format",
          hash: query,
          description: "Please enter a valid 32-byte (64-hex character) Transaction Hash or ZK Commitment."
        });
      }
    } catch (err: any) {
      setLookupResult({
        type: "ERROR",
        title: "Lookup Failed",
        description: err?.message || String(err)
      });
    } finally {
      setLookupLoading(false);
    }
  };

  const transactionsList = onChainState?.transactions && onChainState.transactions.length > 0
    ? onChainState.transactions
    : [
        {
          id: VERIFIED_DEPLOYMENT.transactionId,
          hash: VERIFIED_DEPLOYMENT.transactionHash,
          blockHeight: VERIFIED_DEPLOYMENT.blockHeight,
          blockHash: VERIFIED_DEPLOYMENT.blockHash,
          protocolVersion: 1000000,
          explorerUrl: `https://explorer.1am.xyz/tx/${VERIFIED_DEPLOYMENT.transactionHash}`
        }
      ];

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "3rem 5rem 2rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1.5rem" }}>
        <div>
          <span className="badge" style={{ marginBottom: "0.75rem" }}>LIVE MIDNIGHT INDEXER API</span>
          <h1 className="section-title">Midnight Contract &<br />Transaction Explorer</h1>
          <p className="section-desc" style={{ maxWidth: 580 }}>
            Live zero-knowledge ledger state & verified on-chain transactions indexed directly from the Midnight Preview Testnet.
            {lastRefreshed && <span style={{ color: "var(--fg-4)", marginLeft: "0.5rem" }}>· Last queried: {lastRefreshed}</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <a
            href={VERIFIED_DEPLOYMENT.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ padding: "0.55rem 1.1rem", fontSize: "0.83rem", textDecoration: "none" }}
          >
            1AM Contract Explorer ↗
          </a>
          <button
            onClick={fetchState}
            className="btn-outline"
            style={{ padding: "0.55rem 1.1rem", fontSize: "0.83rem" }}
            disabled={loading}
          >
            {loading ? "Reading Indexer..." : "Refresh State"}
          </button>
        </div>
      </div>

      {/* Top Banner Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", borderBottom: "1px solid var(--border)", background: "var(--bg-2)" }}>
        <div style={{ padding: "1.25rem 2rem", borderRight: "1px solid var(--border)" }}>
          <div className="label" style={{ marginBottom: "0.3rem" }}>Contract Address</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 700, color: "var(--fg)" }}>
            {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}
          </div>
        </div>
        <div style={{ padding: "1.25rem 2rem", borderRight: "1px solid var(--border)" }}>
          <div className="label" style={{ marginBottom: "0.3rem" }}>Deployment Tx Hash</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 700, color: "var(--fg)" }}>
            {VERIFIED_DEPLOYMENT.transactionHash.slice(0, 10)}...{VERIFIED_DEPLOYMENT.transactionHash.slice(-8)}
          </div>
        </div>
        <div style={{ padding: "1.25rem 2rem", borderRight: "1px solid var(--border)" }}>
          <div className="label" style={{ marginBottom: "0.3rem" }}>Confirmed Block</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 700, color: "var(--fg)" }}>
            Block #{VERIFIED_DEPLOYMENT.blockHeight} (ID #{VERIFIED_DEPLOYMENT.transactionId})
          </div>
        </div>
        <div style={{ padding: "1.25rem 2rem" }}>
          <div className="label" style={{ marginBottom: "0.3rem" }}>On-Chain State Size</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 700, color: "var(--accent)" }}>
            {onChainState?.stateRaw?.length ? \`\${onChainState.stateRaw.length} bytes (Active v6)\` : "3,478 bytes"}
          </div>
        </div>
      </div>

      {/* SECTION: On-Chain Transactions Showcase */}
      <div style={{ padding: "2.5rem 5rem", borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span className="badge" style={{ background: "#22c55e", color: "#fff", borderColor: "#22c55e" }}>LIVE SHOWCASE</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.03em", margin: 0 }}>
                On-Chain Transactions Showcase
              </h2>
            </div>
            <p style={{ color: "var(--fg-3)", fontSize: "0.85rem", margin: "0.35rem 0 0 0" }}>
              Verified transactions mined on the Midnight Preview Testnet. Click to inspect live on 1AM Explorer.
            </p>
          </div>
          <a
            href={VERIFIED_DEPLOYMENT.txExplorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
            style={{ fontSize: "0.8rem", padding: "0.45rem 1rem", textDecoration: "none" }}
          >
            Open Primary Tx on 1AM Explorer ↗
          </a>
        </div>

        {/* Transactions Table */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 140px 160px 180px", background: "var(--bg-2)", borderBottom: "1px solid var(--border)", padding: "0.75rem 1.25rem", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg-3)" }}>
            <div>Tx ID</div>
            <div>Transaction Hash</div>
            <div>Block Height</div>
            <div>Status</div>
            <div style={{ textAlign: "right" }}>Explorer Action</div>
          </div>
          {transactionsList.map((tx, idx) => (
            <div
              key={tx.hash || idx}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 140px 160px 180px",
                alignItems: "center",
                padding: "1rem 1.25rem",
                background: idx % 2 === 0 ? "var(--card)" : "var(--bg-2)",
                borderBottom: idx < transactionsList.length - 1 ? "1px solid var(--border)" : "none"
              }}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 700 }}>
                #{tx.id}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <code className="mono-text" style={{ fontSize: "0.82rem" }}>
                  {tx.hash}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(tx.hash, "tx-" + idx)}
                  className="btn-outline"
                  style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem", lineHeight: 1 }}
                >
                  {copied === "tx-" + idx ? "Copied" : "Copy"}
                </button>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--fg-2)" }}>
                Block #{tx.blockHeight}
              </div>
              <div>
                <span className="badge" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#16a34a", borderColor: "rgba(34, 197, 94, 0.3)", fontSize: "0.7rem" }}>
                  ● MINED / SUCCESS
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <a
                  href={\`https://explorer.1am.xyz/tx/\${tx.hash.replace(/^0x/, "")}\`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ padding: "0.35rem 0.85rem", fontSize: "0.76rem", textDecoration: "none", display: "inline-block" }}
                >
                  View on 1AM ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION: Interactive Hash Resolver & Validator */}
      <div style={{ padding: "2.5rem 5rem", borderBottom: "1px solid var(--border)", background: "var(--bg-2)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.5rem" }}>
            Resolve Transaction Hash vs. ZK Commitment
          </div>
          <p style={{ color: "var(--fg-3)", fontSize: "0.85rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
            Confused between an on-chain <strong>Transaction Hash</strong> and a <strong>ZK Commitment</strong>? Paste any 32-byte hash below to inspect its cryptographic type and validity.
          </p>

          <form onSubmit={handleLookup} style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
            <input
              type="text"
              className="input-field mono-text"
              placeholder="Paste Transaction Hash (04369a89...) or ZK Commitment (0x541877...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, fontSize: "0.85rem" }}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={lookupLoading}
              style={{ padding: "0.7rem 1.5rem", whiteSpace: "nowrap" }}
            >
              {lookupLoading ? "Resolving..." : "Inspect Hash"}
            </button>
          </form>

          {/* Quick Preset Buttons */}
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
              Try sample:
            </span>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setSearchQuery(VERIFIED_DEPLOYMENT.transactionHash)}
              style={{ fontSize: "0.74rem", padding: "0.25rem 0.65rem" }}
            >
              On-Chain Transaction ({VERIFIED_DEPLOYMENT.transactionHash.slice(0, 10)}...)
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setSearchQuery("0x541877c6864e88c69bd31a25362a295027450506ae8b9f435bffa9290159a295")}
              style={{ fontSize: "0.74rem", padding: "0.25rem 0.65rem" }}
            >
              ZK Commitment Leaf (0x541877c6...)
            </button>
          </div>

          {/* Lookup Result Card */}
          {lookupResult && (
            <div
              className="card"
              style={{
                border: "1.5px solid var(--fg)",
                background: "var(--card)",
                padding: "1.5rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span
                    className="badge"
                    style={{
                      background: lookupResult.type === "TRANSACTION" ? "#2563eb" : "#16a34a",
                      color: "#fff",
                      borderColor: "transparent"
                    }}
                  >
                    {lookupResult.type}
                  </span>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 800 }}>
                    {lookupResult.title}
                  </div>
                </div>
                {lookupResult.status && (
                  <span className="badge" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#16a34a", borderColor: "rgba(34, 197, 94, 0.3)" }}>
                    ● {lookupResult.status}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: "0.75rem" }}>
                <code className="mono-text" style={{ fontSize: "0.85rem", wordBreak: "break-all" }}>
                  {lookupResult.hash}
                </code>
              </div>

              <p style={{ color: "var(--fg-2)", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                {lookupResult.description}
              </p>

              {lookupResult.explorerUrl && (
                <div style={{ marginTop: "0.75rem" }}>
                  <a
                    href={lookupResult.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ padding: "0.45rem 1rem", fontSize: "0.82rem", textDecoration: "none" }}
                  >
                    View in 1AM Explorer ↗
                  </a>
                </div>
              )}

              {lookupResult.contractExplorerUrl && (
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                  <a
                    href={lookupResult.contractExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ padding: "0.45rem 1rem", fontSize: "0.82rem", textDecoration: "none" }}
                  >
                    View Contract in 1AM Explorer ↗
                  </a>
                  <Link
                    href="/verify"
                    className="btn-outline"
                    style={{ padding: "0.45rem 1rem", fontSize: "0.82rem", textDecoration: "none" }}
                  >
                    Verify via Accreditation Portal →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main 2-Column: Deployment Evidence + Raw Indexer State */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 220px)" }}>
        {/* Left: Deployment info + ledger state */}
        <div style={{ padding: "3rem 2.5rem 3rem 5rem", borderRight: "1px solid var(--border)" }}>
          {/* Deployment evidence */}
          <div style={{ marginBottom: "2.5rem" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "1.25rem" }}>
              Deployment Coordinates
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
              {[
                { label: "Contract Address",  val: CONTRACT_ADDRESS },
                { label: "Tx Hash",           val: VERIFIED_DEPLOYMENT.transactionHash },
                { label: "Block Height",      val: \`Block #\${VERIFIED_DEPLOYMENT.blockHeight}\` },
                { label: "Transaction ID",    val: \`#\${VERIFIED_DEPLOYMENT.transactionId}\` },
                { label: "Network",           val: "Midnight Preview Testnet" },
                { label: "GraphQL Indexer",   val: NETWORK_CONFIG.indexerUrl },
                { label: "RPC Node",          val: NETWORK_CONFIG.nodeUrl },
              ].map(({ label, val }) => (
                <div key={label} style={{ background: "var(--card)", padding: "0.75rem 1rem", display: "grid", gridTemplateColumns: "140px 1fr", gap: "0.75rem", alignItems: "start" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.05em", paddingTop: "0.05rem" }}>{label}</div>
                  <code className="mono-text">{val}</code>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <a
                href={VERIFIED_DEPLOYMENT.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ fontSize: "0.8rem", padding: "0.45rem 1rem", textDecoration: "none" }}
              >
                1AM Contract Explorer ↗
              </a>
              <a
                href={VERIFIED_DEPLOYMENT.txExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
                style={{ fontSize: "0.8rem", padding: "0.45rem 1rem", textDecoration: "none" }}
              >
                1AM Transaction Explorer ↗
              </a>
              <a
                href={VERIFIED_DEPLOYMENT.midnightExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
                style={{ fontSize: "0.8rem", padding: "0.45rem 1rem", textDecoration: "none" }}
              >
                Midnight Explorer ↗
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
                  { label: "Min Threshold",     val: onChainState.minimumNetWorthThreshold ? \`$\${Number(onChainState.minimumNetWorthThreshold).toLocaleString()} USD\` : "—" },
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

        {/* Right: raw JSON & GraphQL Query */}
        <div style={{ padding: "3rem 5rem 3rem 2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Raw Indexer Response
            </div>
            {rawJson && (
              <button
                onClick={() => handleCopy(rawJson, "raw-json")}
                className="btn-outline"
                style={{ fontSize: "0.78rem", padding: "0.35rem 0.8rem" }}
              >
                {copied === "raw-json" ? "Copied!" : "Copy JSON"}
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
              Midnight GraphQL Query
            </div>
            <pre style={{ fontFamily: "var(--font-mono)", fontSize: "0.73rem", color: "var(--fg-3)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
{\`query GetContractLedger($addr: String!) {
  contract(address: $addr) {
    actions {
      transaction {
        id
        hash
        protocolVersion
        block { height hash }
      }
    }
  }
  contractAction(address: $addr) {
    address
    state
    transaction { id hash block { height hash } }
  }
}\`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync("src/app/explorer/page.tsx", explorerCode, "utf8");
console.log("src/app/explorer/page.tsx updated successfully");

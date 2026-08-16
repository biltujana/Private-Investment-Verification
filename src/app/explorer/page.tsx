import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Midnight Explorer | Private Investment Verification",
  description: "View live on-chain state of the Private Investment Verification ZK contract on Midnight Preview.",
};

const CONTRACT_ADDRESS = "0x5292a220155624990f23cff1d979fe66137264e240982a2a32901b8060951d6a";

export default function ExplorerPage() {
  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
          <span className="badge badge-sapphire">Midnight Explorer</span>
          <span className="badge badge-emerald">🟢 GraphQL Indexer Active</span>
          <span className="badge badge-cyan">Preview Testnet</span>
        </div>
        <h1 className="section-title">Contract Explorer & Ledger Inspector</h1>
        <p className="section-desc">
          Live on-chain state of the Private Investment Verification ZK contract deployed on the Midnight Network Preview testnet.
        </p>
      </div>

      {/* ── Contract Address Card ── */}
      <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.5rem", borderLeft: "3px solid #3b82f6" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Deployed Compact Contract Address
          </div>
          <span className="badge badge-sapphire">Verified On-Chain</span>
        </div>
        <code style={{ fontSize: "0.88rem", color: "#06b6d4", wordBreak: "break-all", display: "block", background: "rgba(0, 0, 0, 0.3)", padding: "0.75rem", borderRadius: "8px" }}>
          {CONTRACT_ADDRESS}
        </code>
        <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <a
            href={`https://preview.midnightexplorer.com/contracts/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ display: "inline-flex" }}
          >
            🔍 View on Midnight Explorer ↗
          </a>
          <a
            href="https://faucet.preview.midnight.network"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            💧 Testnet Faucet ↗
          </a>
        </div>
      </div>

      {/* ── Public Ledger Fields ── */}
      <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#eab308", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Public Ledger Schema (8 On-Chain Fields)
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[
            { field: "verifiedCount: Counter", desc: "Total verified accredited investor commitments", color: "#3b82f6" },
            { field: "revokedCount: Counter", desc: "Total revoked / disqualified investor claims", color: "#f43f5e" },
            { field: "activeSession: Counter", desc: "Epoch nonce for replay attack prevention", color: "#06b6d4" },
            { field: "fundId: Bytes<32>", desc: "Active investment fund offering / deal identifier", color: "#6366f1" },
            { field: "fundManagerCommitment: Bytes<32>", desc: "Fund manager authority anchor derived from signing key", color: "#eab308" },
            { field: "lastVerificationCommitment: Bytes<32>", desc: "Most recent ZK accredited investor commitment hash", color: "#10b981" },
            { field: "lastRevokedCommitment: Bytes<32>", desc: "Most recent revoked accreditation hash", color: "#f43f5e" },
            { field: "minimumNetWorthThreshold: Uint<32>", desc: "Minimum qualified net worth requirement ($1,000,000+ USD)", color: "#06b6d4" },
          ].map(f => (
            <div key={f.field} style={{ display: "flex", gap: "1rem", padding: "0.75rem 0", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", alignItems: "center", flexWrap: "wrap" }}>
              <code style={{ fontSize: "0.82rem", color: f.color, minWidth: "280px" }}>{f.field}</code>
              <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>{f.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Network Endpoints ── */}
      <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#10b981", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Midnight Preview Network Infrastructure
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>GraphQL Indexer API</div>
            <code style={{ fontSize: "0.75rem", color: "#60a5fa", wordBreak: "break-all" }}>https://indexer.preview.midnight.network/api/v4/graphql</code>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>Node RPC Provider</div>
            <code style={{ fontSize: "0.75rem", color: "#06b6d4", wordBreak: "break-all" }}>https://rpc.preview.midnight.network</code>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link href="/" className="btn-secondary">Back to Dashboard</Link>
        <Link href="/verify" className="btn-primary">Verify Investor Accreditation →</Link>
      </div>
    </div>
  );
}

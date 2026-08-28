"use client";

import Link from "next/link";
import { NETWORK_CONFIG, CONTRACT_ADDRESS } from "@/lib/contract";

export default function ExplorerPage() {
  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-emerald">Midnight Explorer</span>
          <span className="badge badge-cyan">Preview Testnet</span>
          <span className="badge badge-indigo">Midnight.js SDK</span>
        </div>
        <h1 className="section-title">Contract Explorer</h1>
        <p className="section-desc">
          Live on-chain state of the Private Investment Verification ZK contract on Midnight Preview.
        </p>
      </div>

      <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Contract Address
        </div>
        <code style={{ fontSize: "0.85rem", color: "#06b6d4", wordBreak: "break-all" }}>
          {CONTRACT_ADDRESS}
        </code>
        <div style={{ marginTop: "1.25rem" }}>
          <a
            href={NETWORK_CONFIG.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ display: "inline-flex" }}
          >
            🔍 View on Midnight Explorer →
          </a>
        </div>
      </div>

      <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Public Ledger Fields (8 On-Chain Fields)
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[
            { field: "verifiedCount: Counter", desc: "Total verified accredited investor commitments", color: "#10b981" },
            { field: "revokedCount: Counter", desc: "Total disqualified / revoked investor claims", color: "#f43f5e" },
            { field: "activeSession: Counter", desc: "Epoch nonce for capital call replay attack prevention", color: "#06b6d4" },
            { field: "fundId: Bytes<32>", desc: "Active investment fund offering identifier", color: "#6366f1" },
            { field: "fundManagerCommitment: Bytes<32>", desc: "General Partner authority anchor derived from signing key", color: "#eab308" },
            { field: "lastVerificationCommitment: Bytes<32>", desc: "Most recent ZK investor qualification commitment hash", color: "#10b981" },
            { field: "lastRevokedCommitment: Bytes<32>", desc: "Most recent revoked investor hash", color: "#f43f5e" },
            { field: "minimumNetWorthThreshold: Uint<32>", desc: "Minimum accredited net worth threshold ($2,500,000 USD)", color: "#06b6d4" },
          ].map(f => (
            <div key={f.field} style={{ display: "flex", gap: "1rem", padding: "0.75rem 0", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <code style={{ fontSize: "0.8rem", color: f.color, minWidth: "270px" }}>{f.field}</code>
              <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{f.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link href="/" className="btn-secondary">Back to Dashboard</Link>
        <Link href="/verify" className="btn-primary">Verify Accredited Status →</Link>
      </div>
    </div>
  );
}
